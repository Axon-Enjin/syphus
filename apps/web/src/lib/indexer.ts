import { eq, desc, and, gte, lte } from "drizzle-orm";
import {
  getDb,
  wallets,
  transactions,
  indexerCursors,
} from "@gig-payout/db";
import { fetchPayments } from "@gig-payout/stellar";

export async function indexAllWallets() {
  const db = getDb();
  const allWallets = await db.select().from(wallets);
  let indexed = 0;

  for (const wallet of allWallets) {
    const [cursor] = await db
      .select()
      .from(indexerCursors)
      .where(eq(indexerCursors.walletId, wallet.id))
      .limit(1);

    const pagingToken = cursor?.pagingToken ?? null;

    try {
      const { records, nextCursor } = await fetchPayments(
        wallet.publicKey,
        pagingToken,
      );

      for (const payment of records) {
        if (!payment.transaction_successful) continue;

        await db
          .insert(transactions)
          .values({
            userId: wallet.userId,
            walletId: wallet.id,
            transactionHash: payment.transaction_hash,
            senderAddress: payment.from,
            amountUsdc: payment.amount,
            stellarCreatedAt: new Date(payment.created_at),
          })
          .onConflictDoNothing({ target: transactions.transactionHash });

        indexed += 1;
      }

      if (nextCursor) {
        await db
          .insert(indexerCursors)
          .values({
            walletId: wallet.id,
            pagingToken: nextCursor,
          })
          .onConflictDoUpdate({
            target: indexerCursors.walletId,
            set: { pagingToken: nextCursor, updatedAt: new Date() },
          });
      }
    } catch {
      // Horizon unavailable; skip wallet this cycle
    }
  }

  return { indexed };
}

export async function getUserTransactions(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.stellarCreatedAt))
    .limit(100);
}

export async function getTransactionsInRange(
  userId: string,
  from: Date,
  to: Date,
) {
  const db = getDb();
  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.stellarCreatedAt, from),
        lte(transactions.stellarCreatedAt, to),
      ),
    )
    .orderBy(desc(transactions.stellarCreatedAt));
}

export async function getUserWallet(userId: string) {
  const db = getDb();
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);
  return wallet ?? null;
}
