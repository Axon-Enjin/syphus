"use server";

import bcrypt from "bcryptjs";
import { getDb, users, wallets, withDbRetry, eq } from "@syphus/db";
import { generateKeypair, checkUsdcTrustline, addUsdcTrustline, isValidPublicKey, fundTestnetAccount, isTestnet } from "@syphus/stellar";
import { z } from "zod";
import { encryptSecret } from "@/lib/crypto";
import { auth } from "@/lib/auth";

// --- Schemas ---

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
});

// --- Types ---

export interface FieldErrors {
  email?: string;
  password?: string;
  name?: string;
  stellarAddress?: string;
}

export interface RegisterResult {
  ok?: true;
  error?: string;
  fieldErrors?: FieldErrors;
}

export interface TrustlineResult {
  ok?: true;
  ready: boolean;
  balance?: string | null;
  error?: string;
}

// --- Actions ---

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof FieldErrors;
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { fieldErrors };
  }

  // Validate optional Stellar address
  const stellarAddress = (formData.get("stellarAddress") as string)?.trim() || null;
  if (stellarAddress && !isValidPublicKey(stellarAddress)) {
    return { fieldErrors: { stellarAddress: "Invalid Stellar public key" } };
  }

  try {
    return await withDbRetry(async () => {
      const db = getDb();
      const email = parsed.data.email.toLowerCase();

      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length > 0) {
        return { fieldErrors: { email: "Email already registered" } };
      }

      if (stellarAddress) {
        const existingWallet = await db
          .select({ id: wallets.id })
          .from(wallets)
          .where(eq(wallets.publicKey, stellarAddress))
          .limit(1);

        if (existingWallet.length > 0) {
          return {
            fieldErrors: {
              stellarAddress:
                "This Stellar address is already linked to another account",
            },
          };
        }
      }

      const passwordHash = await bcrypt.hash(parsed.data.password, 12);

      let publicKey: string;
      let encryptedSecretValue: string | null = null;

      if (stellarAddress) {
        publicKey = stellarAddress;
      } else {
        const keypair = generateKeypair();
        publicKey = keypair.publicKey;
        encryptedSecretValue = encryptSecret(keypair.secretKey);
      }

      const [user] = await db
        .insert(users)
        .values({
          email,
          name: parsed.data.name,
          passwordHash,
        })
        .returning({ id: users.id });

      await db.insert(wallets).values({
        userId: user.id,
        publicKey,
        encryptedSecret: encryptedSecretValue,
        trustlineReady: false,
      });

      if (isTestnet()) {
        await fundTestnetAccount(publicKey);
      }

      return { ok: true as const };
    });
  } catch (err) {
    console.error("registerUser database error:", err);
    return {
      error:
        "Could not reach the database. Check your network and try again in a few seconds.",
    };
  }
}

/**
 * Verify the USDC trustline on-chain for the current user's wallet.
 * Updates wallets.trustlineReady if the trustline is found.
 */
export async function verifyTrustline(): Promise<TrustlineResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ready: false, error: "Not authenticated" };
  }

  const db = getDb();
  const [wallet] = await db
    .select({ publicKey: wallets.publicKey, trustlineReady: wallets.trustlineReady })
    .from(wallets)
    .where(eq(wallets.userId, session.user.id))
    .limit(1);

  if (!wallet) {
    return { ready: false, error: "No wallet found" };
  }

  if (wallet.trustlineReady) {
    return { ok: true, ready: true };
  }

  try {
    const status = await checkUsdcTrustline(wallet.publicKey);

    if (status.exists) {
      await db
        .update(wallets)
        .set({ trustlineReady: true })
        .where(eq(wallets.userId, session.user.id));

      return { ok: true, ready: true, balance: status.balance };
    }

    return { ready: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Trustline check failed";
    return { ready: false, error: message };
  }
}

export interface SetupTrustlineResult {
  ok?: true;
  transactionHash?: string;
  error?: string;
}

export interface BuildTrustlineXdrResult {
  xdr?: string;
  error?: string;
}

/**
 * Build the changeTrust transaction XDR for the user's wallet.
 * The client (Freighter) will sign and submit it.
 */
export async function buildTrustlineXdr(): Promise<BuildTrustlineXdrResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const db = getDb();
  const [wallet] = await db
    .select({
      publicKey: wallets.publicKey,
      trustlineReady: wallets.trustlineReady,
    })
    .from(wallets)
    .where(eq(wallets.userId, session.user.id))
    .limit(1);

  if (!wallet) {
    return { error: "No wallet found" };
  }

  if (wallet.trustlineReady) {
    return { error: "Trustline already active" };
  }

  // Build the transaction XDR (unsigned) for Freighter to sign
  const { buildUnsignedTrustlineTx } = await import("@syphus/stellar");
  const result = await buildUnsignedTrustlineTx(wallet.publicKey);

  if (!result.success) {
    return { error: result.error ?? "Failed to build transaction" };
  }

  return { xdr: result.xdr };
}

/**
 * Fund the USDC trustline server-side: decrypt the wallet secret,
 * build and submit a changeTrust transaction, then mark trustlineReady.
 */
export async function setupTrustline(): Promise<SetupTrustlineResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const db = getDb();
  const [wallet] = await db
    .select({
      publicKey: wallets.publicKey,
      encryptedSecret: wallets.encryptedSecret,
      trustlineReady: wallets.trustlineReady,
    })
    .from(wallets)
    .where(eq(wallets.userId, session.user.id))
    .limit(1);

  if (!wallet) {
    return { error: "No wallet found" };
  }

  if (wallet.trustlineReady) {
    return { ok: true };
  }

  if (!wallet.encryptedSecret) {
    return { error: "External wallet: add the USDC trustline in your own wallet app, then verify." };
  }

  // Decrypt the secret key
  const { decryptSecret } = await import("@/lib/crypto");
  const secretKey = decryptSecret(wallet.encryptedSecret);

  // Submit changeTrust transaction
  const result = await addUsdcTrustline(secretKey);

  if (!result.success) {
    return { error: result.error ?? "Failed to add trustline" };
  }

  // Mark trustline as ready in DB
  await db
    .update(wallets)
    .set({ trustlineReady: true })
    .where(eq(wallets.userId, session.user.id));

  return { ok: true, transactionHash: result.transactionHash };
}

/**
 * Manual fallback: mark trustline ready (kept for admin/testing use).
 */
export async function markTrustlineReady(userId: string) {
  const db = getDb();
  await db
    .update(wallets)
    .set({ trustlineReady: true })
    .where(eq(wallets.userId, userId));
  return { ok: true as const };
}

export interface LinkFreighterResult {
  ok?: true;
  error?: string;
}

/**
 * Link the signed-in user's Syphus wallet to a Freighter public key.
 * Clears custodial secret; trustline status is re-checked on-chain.
 */
export async function linkFreighterWallet(
  publicKey: string,
): Promise<LinkFreighterResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const trimmed = publicKey.trim();
  if (!isValidPublicKey(trimmed)) {
    return { error: "Invalid Stellar address" };
  }

  const db = getDb();

  const [current] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, session.user.id))
    .limit(1);

  if (!current) {
    return { error: "No wallet found" };
  }

  const [existing] = await db
    .select({ userId: wallets.userId })
    .from(wallets)
    .where(eq(wallets.publicKey, trimmed))
    .limit(1);

  if (existing && existing.userId !== session.user.id) {
    return {
      error: "This Stellar address is already linked to another account",
    };
  }

  const trustlineStatus = await checkUsdcTrustline(trimmed);
  const pubkeyChanged = current.publicKey !== trimmed;

  await db
    .update(wallets)
    .set({
      publicKey: trimmed,
      encryptedSecret: null,
      trustlineReady: trustlineStatus.exists,
    })
    .where(eq(wallets.userId, session.user.id));

  if (pubkeyChanged) {
    const { resetIndexerCursor } = await import("@/lib/indexer");
    await resetIndexerCursor(current.id);
  }

  return { ok: true };
}
