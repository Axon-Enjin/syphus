"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBatchFromCsv } from "@/app/actions/batch";
import { Card, FieldLabel, Input, PageHeader } from "@/components/ui";
import { LoadingButton } from "@/components/ui-interactive";

export function BatchUploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await createBatchFromCsv(new FormData(e.currentTarget));
    setLoading(false);

    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("ok" in res && res.ok && "batchId" in res) {
      router.push(`/dashboard/batch/${res.batchId}`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Batch payout"
        description="Upload a CSV of contractor payouts and generate SEP-7 payment links for your treasury wallet."
      />

      <Card title="CSV format">
        <p className="text-sm text-[var(--color-muted)]">
          Required columns: <code>name</code>, <code>stellar_address</code>,{" "}
          <code>amount_usdc</code>. Optional: <code>memo</code>. Max 50 rows per
          batch.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-[var(--color-bg)] p-3 text-xs">
{`name,stellar_address,amount_usdc,memo
Maria Reyes,GABC...,500,INV-001
John Doe,GDEF...,250,INV-002`}
        </pre>
      </Card>

      <Card title="Upload batch">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="batchName">Batch name</FieldLabel>
            <Input
              id="batchName"
              name="name"
              placeholder="March 2026 payroll"
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="csv">CSV file</FieldLabel>
            <input
              id="csv"
              name="csv"
              type="file"
              accept=".csv,text/csv"
              required
              className="focus-ring w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-inset)] file:px-3 file:py-1 file:text-sm"
            />
          </div>
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <LoadingButton
            type="submit"
            loading={loading}
            loadingLabel="Creating batch…"
          >
            Create batch
          </LoadingButton>
        </form>
      </Card>
    </div>
  );
}
