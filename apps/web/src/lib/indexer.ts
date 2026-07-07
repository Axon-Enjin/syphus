import { eq, desc, and, gte, lte } from "@gig-payout/db";
import {
  getDb,
  wallets,
  transactions,
  indexerCursors,
} from "@gig-payout/db";
import { fetchPayments } from "@gig-payout/stellar";

export interface WalletIndexResult {
  walletId: string;
  publicKey: string;
  newCount: number;
  error?: string;
}

export async function indexAllWallets(): Promise<{
  indexed: number;
  wallets: WalletIndexResult[];
}> {
  const db = getDb();
  const allWallets = await db.select().from(wallets);
  let indexed = 0;
  const walletResults: WalletIndexResult[] = [];

  for (const wallet of allWallets) {
    let newCount = 0;

    try {
      const [cursor] = await db
        .select()
        .from(indexerCursors)
        .where(eq(indexerCursors.walletId, wallet.id))
        .limit(1);

      const pagingToken = cursor?.pagingToken ?? null;

      const { records, nextCursor } = await fetchPayments(
        wallet.publicKey,
        pagingToken,
      );

      for (const payment of records) {
        if (!payment.transaction_successful) continue;

        const inserted = await db
          .insert(transactions)
          .values({
            userId: wallet.userId,
            walletId: wallet.id,
            transactionHash: payment.transaction_hash,
            senderAddress: payment.from,
            amountUsdc: payment.amount,
            memo: payment.memo ?? null,
            stellarCreatedAt: new Date(payment.created_at),
          })
          .onConflictDoNothing({ target: transactions.transactionHash })
          .returning({ id: transactions.id });

        if (inserted.length > 0) {
          newCount += 1;
          indexed += 1;
        }
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

      walletResults.push({
        walletId: wallet.id,
        publicKey: wallet.publicKey,
        newCount,
      });
    } catch (err) {
      walletResults.push({
        walletId: wallet.id,
        publicKey: wallet.publicKey,
        newCount: 0,
        error: err instanceof Error ? err.message : "Index failed",
      });
    }
  }

  return { indexed, wallets: walletResults };
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
