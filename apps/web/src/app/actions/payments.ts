"use server";

import { eq } from "@syphus/db";
import { randomUUID } from "crypto";
import { getDb, paymentLinks, wallets, users } from "@syphus/db";
import {
  buildSep7Uri,
  isSorobanEnabled,
  registerPaymentLink,
} from "@syphus/stellar";
import { auth } from "@/lib/auth";
import { z } from "zod";

const linkSchema = z.object({
  amountUsdc: z.string().optional(),
  memo: z.string().max(28).optional(),
  label: z.string().max(255).optional(),
});

export async function createPaymentLink(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = linkSchema.safeParse({
    amountUsdc: formData.get("amountUsdc") || undefined,
    memo: formData.get("memo") || undefined,
    label: formData.get("label") || undefined,
  });
  if (!parsed.success) {
    return { error: "Invalid link data" };
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

  // Slug is the settlement key: SEP-7 memo defaults to slug so the indexer
  // can match inbound USDC to this link and call mark_link_paid (PRD-F9).
  const slug = randomUUID().replace(/-/g, "").slice(0, 16);
  const memo = parsed.data.memo?.trim() || slug;

  const [link] = await db
    .insert(paymentLinks)
    .values({
      userId: session.user.id,
      slug,
      amountUsdc: parsed.data.amountUsdc ?? null,
      memo,
      label: parsed.data.label ?? null,
      onChainStatus: isSorobanEnabled() ? "pending" : "skipped",
    })
    .returning();

  if (isSorobanEnabled()) {
    const soroban = await registerPaymentLink({
      slug,
      creator: wallet.publicKey,
      destination: wallet.publicKey,
      amountUsdc: parsed.data.amountUsdc ?? null,
      memo,
    });

    if (soroban.ok && soroban.txHash) {
      await db
        .update(paymentLinks)
        .set({
          onChainStatus: "registered",
          registerTxHash: soroban.txHash,
        })
        .where(eq(paymentLinks.id, link.id));
    } else {
      await db
        .update(paymentLinks)
        .set({ onChainStatus: "skipped" })
        .where(eq(paymentLinks.id, link.id));
    }
  }

  const sep7 = buildSep7Uri({
    destination: wallet.publicKey,
    amount: parsed.data.amountUsdc,
    memo,
  });

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  return {
    ok: true as const,
    slug: link.slug,
    sep7Uri: sep7,
    checkoutUrl: `${baseUrl}/p/${link.slug}`,
  };
}

export async function getPaymentLinkBySlug(slug: string) {
  try {
    const db = getDb();
    const [row] = await db
      .select({
        slug: paymentLinks.slug,
        amountUsdc: paymentLinks.amountUsdc,
        memo: paymentLinks.memo,
        label: paymentLinks.label,
        registerTxHash: paymentLinks.registerTxHash,
        onChainStatus: paymentLinks.onChainStatus,
        publicKey: wallets.publicKey,
        userName: users.name,
      })
      .from(paymentLinks)
      .innerJoin(wallets, eq(paymentLinks.userId, wallets.userId))
      .innerJoin(users, eq(paymentLinks.userId, users.id))
      .where(eq(paymentLinks.slug, slug))
      .limit(1);

    if (!row) return null;

    const sep7 = buildSep7Uri({
      destination: row.publicKey,
      amount: row.amountUsdc ?? undefined,
      memo: row.memo ?? undefined,
    });

    return { ...row, sep7Uri: sep7 };
  } catch {
    return null;
  }
}
