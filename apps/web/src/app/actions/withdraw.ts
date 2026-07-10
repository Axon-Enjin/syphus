"use server";

import { and, eq } from "@syphus/db";
import { getDb, wallets, withdrawals, transactions } from "@syphus/db";
import {
  getActiveProvider,
  getActiveProviderId,
  getProvider,
  isOffRampPaused,
} from "@syphus/anchors";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { buildWithdrawCallbackUrl } from "@/lib/callback-url";
import { z } from "zod";

const withdrawSchema = z.object({
  amountUsdc: z.string().regex(/^\d+(\.\d{1,7})?$/),
});

const WITHDRAW_LIMIT = 5;
const WITHDRAW_WINDOW_MS = 60 * 60 * 1000;

async function getWithdrawableBalance(userId: string): Promise<number> {
  const db = getDb();

  const allInbound = await db
    .select({ amountUsdc: transactions.amountUsdc })
    .from(transactions)
    .where(eq(transactions.userId, userId));

  const allWithdrawn = await db
    .select({ amountUsdc: withdrawals.amountUsdc })
    .from(withdrawals)
    .where(
      and(
        eq(withdrawals.userId, userId),
        eq(withdrawals.status, "completed"),
      ),
    );

  const received = allInbound.reduce(
    (sum, row) => sum + (parseFloat(row.amountUsdc) || 0),
    0,
  );
  const withdrawn = allWithdrawn.reduce(
    (sum, row) => sum + (parseFloat(row.amountUsdc) || 0),
    0,
  );

  return Math.max(0, received - withdrawn);
}

/** Dev/mock helper: mark anchor KYC complete without a live SEP-24 session. */
export async function markMockKycComplete() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (process.env.ANCHOR_PROVIDER !== "mock") {
    return {
      error: "Mock KYC is only available when ANCHOR_PROVIDER=mock",
    };
  }

  const db = getDb();
  await db
    .update(wallets)
    .set({ anchorKycComplete: true })
    .where(eq(wallets.userId, session.user.id));

  return { ok: true as const };
}

export async function startWithdrawal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (isOffRampPaused()) {
    return {
      error:
        "Off-ramp is temporarily paused while anchor partners recover. You can still receive USDC.",
    };
  }

  const limit = rateLimit(
    `withdraw:${session.user.id}`,
    WITHDRAW_LIMIT,
    WITHDRAW_WINDOW_MS,
  );
  if (!limit.ok) {
    const minutes = Math.ceil(limit.retryAfterMs / 60_000);
    return {
      error: `Too many withdrawal attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const parsed = withdrawSchema.safeParse({
    amountUsdc: formData.get("amountUsdc"),
  });
  if (!parsed.success) {
    return { error: "Invalid amount" };
  }

  const amount = parseFloat(parsed.data.amountUsdc);
  if (amount <= 0) {
    return { error: "Amount must be greater than zero" };
  }

  const db = getDb();
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, session.user.id))
    .limit(1);

  if (!wallet) {
    return { error: "Wallet not found" };
  }
  if (!wallet.trustlineReady) {
    return { error: "Complete trustline setup before off-ramp" };
  }

  const balance = await getWithdrawableBalance(session.user.id);
  if (amount > balance) {
    return { error: "Insufficient USDC balance for this withdrawal" };
  }

  const provider = getActiveProvider();

  try {
    const callbackUrl = buildWithdrawCallbackUrl();
    const sessionResult = await provider.startWithdrawal({
      amountUsdc: parsed.data.amountUsdc,
      destinationAccount: wallet.publicKey,
      callbackUrl,
    });

    await db.insert(withdrawals).values({
      userId: session.user.id,
      provider: getActiveProviderId(),
      anchorSessionId: sessionResult.id,
      amountUsdc: parsed.data.amountUsdc,
      status: "pending",
      redirectUrl: sessionResult.url,
    });

    return {
      ok: true as const,
      redirectUrl: sessionResult.url,
      provider: getActiveProviderId(),
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Off-ramp unavailable",
    };
  }
}

export async function handleWithdrawalCallback(
  anchorSessionId?: string,
  callbackStatus?: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const };
  }
  if (!anchorSessionId) {
    return { error: "Missing withdrawal session" as const };
  }

  const db = getDb();
  const [withdrawal] = await db
    .select()
    .from(withdrawals)
    .where(
      and(
        eq(withdrawals.anchorSessionId, anchorSessionId),
        eq(withdrawals.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!withdrawal) {
    return { error: "Withdrawal not found" as const };
  }

  let status = withdrawal.status as "pending" | "completed" | "failed";

  try {
    const provider = getProvider(withdrawal.provider);
    status = await provider.getWithdrawalStatus(anchorSessionId);
  } catch {
    if (callbackStatus === "completed" || callbackStatus === "success") {
      status = "completed";
    } else if (callbackStatus === "error" || callbackStatus === "failed") {
      status = "failed";
    }
  }

  await db
    .update(withdrawals)
    .set({ status, updatedAt: new Date() })
    .where(eq(withdrawals.id, withdrawal.id));

  if (status === "completed") {
    await db
      .update(wallets)
      .set({ anchorKycComplete: true })
      .where(eq(wallets.userId, session.user.id));
  }

  return {
    ok: true as const,
    status,
    amountUsdc: withdrawal.amountUsdc,
    provider: withdrawal.provider,
  };
}
