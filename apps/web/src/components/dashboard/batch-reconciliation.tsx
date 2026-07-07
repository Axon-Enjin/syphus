"use client";

import Link from "next/link";
import { useState } from "react";
import { markBatchItemCompleted } from "@/app/actions/batch";
import type { Batch, BatchItem } from "@gig-payout/db";
import { Card, StatusBadge } from "@/components/ui";
import { CopyButton } from "@/components/ui-interactive";

interface BatchReconciliationProps {
  batch: Batch;
  items: BatchItem[];
}

export function BatchReconciliation({ batch, items }: BatchReconciliationProps) {
  const [rows, setRows] = useState(items);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const completed = rows.filter((r) => r.status === "completed").length;

  async function markComplete(itemId: string) {
    setError(null);
    setLoadingId(itemId);
    const res = await markBatchItemCompleted(itemId);
    setLoadingId(null);

    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === itemId ? { ...row, status: "completed" } : row,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
        <span>
          {completed} of {rows.length} sent
        </span>
        <span>·</span>
        <span>{batch.totalUsdc} USDC total</span>
        <span>·</span>
        {batch.status === "completed" ? (
          <StatusBadge variant="success">Batch complete</StatusBadge>
        ) : (
          <StatusBadge variant="pending">In progress</StatusBadge>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {rows.map((item) => (
          <Card key={item.id} title={item.recipientName}>
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-[var(--color-muted)]">Amount: </span>
                <span className="font-medium">{item.amountUsdc} USDC</span>
              </p>
              <p className="break-all font-mono text-xs text-[var(--color-muted)]">
                {item.destinationAddress}
              </p>
              {item.memo && (
                <p>
                  <span className="text-[var(--color-muted)]">Memo: </span>
                  {item.memo}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <CopyButton text={item.sep7Uri} label="Copy SEP-7 URI" />
                <a
                  href={item.sep7Uri}
                  className="link-accent text-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in wallet
                </a>
                {item.status === "completed" ? (
                  <StatusBadge variant="success">Sent</StatusBadge>
                ) : (
                  <button
                    type="button"
                    disabled={loadingId === item.id}
                    onClick={() => markComplete(item.id)}
                    className="btn-secondary focus-ring px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    {loadingId === item.id ? "Saving…" : "Mark sent"}
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Link href="/dashboard/batch" className="link-accent text-sm">
        ← All batches
      </Link>
    </div>
  );
}
