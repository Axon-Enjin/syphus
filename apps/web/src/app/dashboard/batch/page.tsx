import Link from "next/link";
import { getAgencyBatches, getBatchAccess } from "@/app/actions/batch";
import { BatchUploadForm } from "@/components/dashboard/batch-upload-form";
import { Card, PageHeader, StatusBadge } from "@/components/ui";

export default async function BatchPage() {
  const access = await getBatchAccess();

  if (!access.authorized) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <PageHeader
          title="Batch payout"
          description="Pay multiple contractors from your USDC treasury in one workflow."
        />
        <Card title="Agency plan required">
          <p className="text-sm text-[var(--color-muted)]">
            Batch payout is available on the Agency plan ($49/mo). Upload a CSV,
            generate SEP-7 links for each contractor, and reconcile sends from
            one dashboard.
          </p>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Current plan:{" "}
            <span className="font-medium capitalize text-[var(--color-text)]">
              {access.tier}
            </span>
          </p>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            For pilot access, set{" "}
            <code className="rounded bg-[var(--color-bg)] px-1 py-0.5">
              tier = agency
            </code>{" "}
            on your user record.
          </p>
        </Card>
      </div>
    );
  }

  const result = await getAgencyBatches();
  const batchList =
    "batches" in result && result.batches ? result.batches : [];

  return (
    <div className="space-y-10">
      <BatchUploadForm />

      {batchList.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Recent batches
          </h2>
          <div className="space-y-3">
            {batchList.map((batch) => (
              <Link
                key={batch.id}
                href={`/dashboard/batch/${batch.id}`}
                className="surface-card focus-ring block p-5 transition-colors hover:bg-[var(--color-bg)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{batch.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {batch.itemCount} payouts · {batch.totalUsdc} USDC ·{" "}
                      {batch.createdAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  {batch.status === "completed" ? (
                    <StatusBadge variant="success">Complete</StatusBadge>
                  ) : (
                    <StatusBadge variant="pending">In progress</StatusBadge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
