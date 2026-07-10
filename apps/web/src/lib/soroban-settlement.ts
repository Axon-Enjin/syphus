import { eq, or } from "@gig-payout/db";
import { getDb, paymentLinks } from "@gig-payout/db";
import { isSorobanEnabled, markLinkPaid } from "@gig-payout/stellar";

/**
 * When Horizon indexes an inbound USDC payment, match it to a payment link
 * by memo === slug (default) or memo === custom link memo, then mark paid
 * on the Soroban PaymentRegistry (PRD-F9 / AC-9.3).
 */
export async function settlePaymentLinkOnChain(
  memo: string | null | undefined,
  transactionHash: string,
): Promise<{ settled: boolean; slug?: string }> {
  if (!memo || !isSorobanEnabled()) {
    return { settled: false };
  }

  const trimmed = memo.trim();
  if (trimmed.length === 0 || trimmed.length > 28) {
    return { settled: false };
  }

  const db = getDb();
  const [link] = await db
    .select()
    .from(paymentLinks)
    .where(
      or(eq(paymentLinks.slug, trimmed), eq(paymentLinks.memo, trimmed)),
    )
    .limit(1);

  if (!link) {
    return { settled: false };
  }

  // Already settled or never registered on-chain
  if (link.onChainStatus === "paid") {
    return { settled: true, slug: link.slug };
  }
  if (link.onChainStatus !== "registered") {
    return { settled: false, slug: link.slug };
  }

  const result = await markLinkPaid({
    slug: link.slug,
    txHash: transactionHash,
  });

  if (result.ok) {
    await db
      .update(paymentLinks)
      .set({ onChainStatus: "paid" })
      .where(eq(paymentLinks.id, link.id));
    return { settled: true, slug: link.slug };
  }

  return { settled: false, slug: link.slug };
}
