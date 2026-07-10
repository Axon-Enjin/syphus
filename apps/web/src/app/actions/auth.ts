"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, users, wallets } from "@syphus/db";
import { generateKeypair } from "@syphus/stellar";
import { z } from "zod";
import { encryptSecret } from "@/lib/crypto";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
});

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: "Invalid registration data" };
  }

  const db = getDb();
  const email = parsed.data.email.toLowerCase();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { error: "Email already registered" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const { publicKey, secretKey } = generateKeypair();
  const encryptedSecret = encryptSecret(secretKey);

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
    encryptedSecret,
    trustlineReady: false,
  });

  return { ok: true as const };
}

export async function markTrustlineReady(userId: string) {
  const db = getDb();
  await db
    .update(wallets)
    .set({ trustlineReady: true })
    .where(eq(wallets.userId, userId));
  return { ok: true as const };
}
