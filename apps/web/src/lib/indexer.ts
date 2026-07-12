import { eq, desc, and, gte, lte } from "@syphus/db";

import {

  getDb,

  wallets,

  transactions,

  indexerCursors,

  type Wallet,

} from "@syphus/db";

import { fetchPayments } from "@syphus/stellar";

import { settlePaymentLinkOnChain } from "@/lib/soroban-settlement";



export interface WalletIndexResult {

  walletId: string;

  publicKey: string;

  newCount: number;

  error?: string;

}



export async function indexWallet(

  wallet: Pick<Wallet, "id" | "userId" | "publicKey">,

): Promise<WalletIndexResult> {

  const db = getDb();

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

        try {

          await settlePaymentLinkOnChain(

            payment.memo,

            payment.transaction_hash,

          );

        } catch {

          // settlement is retried on next poll

        }

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



    return {

      walletId: wallet.id,

      publicKey: wallet.publicKey,

      newCount,

    };

  } catch (err) {

    return {

      walletId: wallet.id,

      publicKey: wallet.publicKey,

      newCount: 0,

      error: err instanceof Error ? err.message : "Index failed",

    };

  }

}



export async function indexWalletForUser(

  userId: string,

): Promise<WalletIndexResult | { error: string }> {

  const wallet = await getUserWallet(userId);

  if (!wallet) {

    return { error: "No wallet found" };

  }

  return indexWallet(wallet);

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

    const result = await indexWallet(wallet);

    indexed += result.newCount;

    walletResults.push(result);

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



export async function resetIndexerCursor(walletId: string) {

  const db = getDb();

  await db

    .delete(indexerCursors)

    .where(eq(indexerCursors.walletId, walletId));

}


