"use server";

import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getDb, paymentLinks, wallets } from "@gig-payout/db";
import { buildSep7Uri } from "@gig-payout/stellar";
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

  const slug = randomUUID().replace(/-/g, "").slice(0, 16);
  const [link] = await db
    .insert(paymentLinks)
    .values({
      userId: session.user.id,
      slug,
      amountUsdc: parsed.data.amountUsdc ?? null,
      memo: parsed.data.memo ?? null,
      label: parsed.data.label ?? null,
    })
    .returning();

  const sep7 = buildSep7Uri({
    destination: wallet.publicKey,
    amount: parsed.data.amountUsdc,
    memo: parsed.data.memo,
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
  const db = getDb();
  const [row] = await db
    .select({
      slug: paymentLinks.slug,
      amountUsdc: paymentLinks.amountUsdc,
      memo: paymentLinks.memo,
      label: paymentLinks.label,
      publicKey: wallets.publicKey,
      userName: wallets.userId,
    })
    .from(paymentLinks)
    .innerJoin(wallets, eq(paymentLinks.userId, wallets.userId))
    .where(eq(paymentLinks.slug, slug))
    .limit(1);

  if (!row) return null;

  const sep7 = buildSep7Uri({
    destination: row.publicKey,
    amount: row.amountUsdc ?? undefined,
    memo: row.memo ?? undefined,
  });

  return { ...row, sep7Uri: sep7 };
}
