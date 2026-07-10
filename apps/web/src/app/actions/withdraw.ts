"use server";

import { eq } from "drizzle-orm";
import { getDb, wallets, withdrawals } from "@syphus/db";
import {
  getActiveProvider,
  getActiveProviderId,
} from "@syphus/anchors";
import { auth } from "@/lib/auth";
import { z } from "zod";

const withdrawSchema = z.object({
  amountUsdc: z.string().regex(/^\d+(\.\d{1,7})?$/),
});

export async function startWithdrawal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = withdrawSchema.safeParse({
    amountUsdc: formData.get("amountUsdc"),
  });
  if (!parsed.success) {
    return { error: "Invalid amount" };
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

  const provider = getActiveProvider();
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  try {
    const sessionResult = await provider.startWithdrawal({
      amountUsdc: parsed.data.amountUsdc,
      destinationAccount: wallet.publicKey,
      callbackUrl: `${baseUrl}/dashboard/withdraw/callback`,
    });

    await db.insert(withdrawals).values({
      userId: session.user.id,
      provider: getActiveProviderId(),
      anchorSessionId: sessionResult.id,
      amountUsdc: parsed.data.amountUsdc,
      status: "pending",
      redirectUrl: sessionResult.url,
    });

    return { ok: true as const, redirectUrl: sessionResult.url };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Off-ramp unavailable",
    };
  }
}
