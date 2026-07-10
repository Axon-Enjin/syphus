"use server";

import { and, desc, eq } from "@syphus/db";
import {
  getDb,
  batches,
  batchItems,
  wallets,
  withDbRetry,
} from "@syphus/db";
import { buildSep7Uri } from "@syphus/stellar";
import {
  isSorobanEnabled,
  registerBatch,
} from "@syphus/stellar";
import { auth } from "@/lib/auth";
import { getUserTier } from "@/lib/auth-helpers";
import { parseBatchCsv, sumBatchAmounts } from "@/lib/batch-csv";
import { z } from "zod";

const batchNameSchema = z.object({
  name: z.string().min(1).max(255),
});

async function requireAgencyUser():
  Promise<{ userId: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const tier = await getUserTier(session.user.id);
  if (tier !== "agency") {
    return {
      error: "Batch payout requires an Agency plan. Contact support to upgrade.",
    };
  }

  return { userId: session.user.id };
}

function deriveBatchStatus(
  items: { status: string }[],
): "pending" | "completed" {
  if (items.length === 0) return "pending";
  return items.every((item) => item.status === "completed")
    ? "completed"
    : "pending";
}

export async function createBatchFromCsv(formData: FormData) {
  const gate = await requireAgencyUser();
  if ("error" in gate) return gate;

  const parsedName = batchNameSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsedName.success) {
    return { error: "Batch name is required" };
  }

  const csvFile = formData.get("csv");
  if (!(csvFile instanceof File) || csvFile.size === 0) {
    return { error: "CSV file is required" };
  }
  if (csvFile.size > 256 * 1024) {
    return { error: "CSV file must be 256 KB or smaller" };
  }

  const csvText = await csvFile.text();
  const parsed = parseBatchCsv(csvText);
  if (parsed.errors?.length) {
    return { error: parsed.errors.join("; ") };
  }
  if (!parsed.rows?.length) {
    return { error: "No payout rows found in CSV" };
  }

  try {
    return await withDbRetry(async () => {
      const db = getDb();
      const totalUsdc = sumBatchAmounts(parsed.rows!);

      const [agencyWallet] = await db
        .select({ publicKey: wallets.publicKey })
        .from(wallets)
        .where(eq(wallets.userId, gate.userId))
        .limit(1);

      const [batch] = await db
        .insert(batches)
        .values({
          userId: gate.userId,
          name: parsedName.data.name,
          status: "pending",
          itemCount: parsed.rows!.length,
          totalUsdc,
          onChainStatus: isSorobanEnabled() ? "pending" : "skipped",
        })
        .returning();

      const itemValues = parsed.rows!.map((row) => ({
        batchId: batch.id,
        recipientName: row.recipientName,
        destinationAddress: row.destinationAddress,
        amountUsdc: row.amountUsdc,
        memo: row.memo ?? null,
        sep7Uri: buildSep7Uri({
          destination: row.destinationAddress,
          amount: row.amountUsdc,
          memo: row.memo,
        }),
        status: "pending" as const,
      }));

      await db.insert(batchItems).values(itemValues);

      if (isSorobanEnabled() && agencyWallet?.publicKey) {
        const soroban = await registerBatch({
          batchId: batch.id,
          creator: agencyWallet.publicKey,
          itemCount: parsed.rows!.length,
          totalUsdc,
        });

        if (soroban.ok && soroban.txHash) {
          await db
            .update(batches)
            .set({
              onChainStatus: "registered",
              registerTxHash: soroban.txHash,
            })
            .where(eq(batches.id, batch.id));
        } else {
          await db
            .update(batches)
            .set({ onChainStatus: "skipped" })
            .where(eq(batches.id, batch.id));
        }
      }

      return {
        ok: true as const,
        batchId: batch.id,
        itemCount: parsed.rows!.length,
        totalUsdc,
      };
    });
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to create batch",
    };
  }
}

export async function getAgencyBatches() {
  const gate = await requireAgencyUser();
  if ("error" in gate) return gate;

  const db = getDb();
  const rows = await db
    .select()
    .from(batches)
    .where(eq(batches.userId, gate.userId))
    .orderBy(desc(batches.createdAt))
    .limit(20);

  return { ok: true as const, batches: rows };
}

export async function getBatchDetail(batchId: string) {
  const gate = await requireAgencyUser();
  if ("error" in gate) return gate;

  const db = getDb();
  const [batch] = await db
    .select()
    .from(batches)
    .where(and(eq(batches.id, batchId), eq(batches.userId, gate.userId)))
    .limit(1);

  if (!batch) {
    return { error: "Batch not found" };
  }

  const items = await db
    .select()
    .from(batchItems)
    .where(eq(batchItems.batchId, batch.id))
    .orderBy(batchItems.createdAt);

  return { ok: true as const, batch, items };
}

export async function markBatchItemCompleted(
  itemId: string,
  transactionHash?: string,
) {
  const gate = await requireAgencyUser();
  if ("error" in gate) return gate;

  const db = getDb();
  const [row] = await db
    .select({
      itemId: batchItems.id,
      batchId: batchItems.batchId,
    })
    .from(batchItems)
    .innerJoin(batches, eq(batchItems.batchId, batches.id))
    .where(
      and(eq(batchItems.id, itemId), eq(batches.userId, gate.userId)),
    )
    .limit(1);

  if (!row) {
    return { error: "Batch item not found" };
  }

  await db
    .update(batchItems)
    .set({
      status: "completed",
      transactionHash: transactionHash?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(batchItems.id, itemId));

  const allItems = await db
    .select({ status: batchItems.status })
    .from(batchItems)
    .where(eq(batchItems.batchId, row.batchId));

  await db
    .update(batches)
    .set({ status: deriveBatchStatus(allItems) })
    .where(eq(batches.id, row.batchId));

  return { ok: true as const };
}

export async function getBatchAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, tier: "solo" as const };
  }
  const tier = await getUserTier(session.user.id);
  return { authorized: tier === "agency", tier };
}
