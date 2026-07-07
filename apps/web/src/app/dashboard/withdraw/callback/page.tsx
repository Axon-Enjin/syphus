import Link from "next/link";
import { handleWithdrawalCallback } from "@/app/actions/withdraw";
import { Card, PageHeader, StatusBadge } from "@/components/ui";

export default async function WithdrawCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; status?: string }>;
}) {
  const params = await searchParams;
  const result = await handleWithdrawalCallback(params.id, params.status);

  if ("error" in result && result.error) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <PageHeader
          title="Withdrawal update"
          description="We could not confirm your withdrawal session."
        />
        <Card title="Something went wrong">
          <p className="text-sm text-red-700" role="alert">
            {result.error}
          </p>
          <Link href="/dashboard/withdraw" className="btn-primary focus-ring mt-4 inline-flex">
            Back to withdraw
          </Link>
        </Card>
      </div>
    );
  }

  const { status, amountUsdc, provider } = result;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Withdrawal update"
        description="Your anchor session has been recorded."
      />

      <Card title="Status">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--color-muted)]">Status</span>
            {status === "completed" ? (
              <StatusBadge variant="success">Completed</StatusBadge>
            ) : status === "failed" ? (
              <StatusBadge variant="warning">Failed</StatusBadge>
            ) : (
              <StatusBadge variant="pending">Pending</StatusBadge>
            )}
          </div>

          <p className="text-sm text-[var(--color-muted)]">
            Amount: <span className="font-medium text-[var(--color-text)]">{amountUsdc} USDC</span>
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            Provider: <span className="font-medium text-[var(--color-text)]">{provider}</span>
          </p>

          {status === "completed" && (
            <p className="text-sm text-[var(--color-success)]">
              Identity verification is complete. Future withdrawals will skip the KYC step.
            </p>
          )}

          {status === "pending" && (
            <p className="text-sm text-[var(--color-muted)]">
              Your withdrawal is still processing with the anchor. Check back in a few minutes or
              refresh this page.
            </p>
          )}

          {status === "failed" && (
            <p className="text-sm text-[var(--color-muted)]">
              The anchor reported an error. You can try again or contact support if funds were debited.
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/dashboard" className="btn-primary focus-ring inline-flex">
              Back to dashboard
            </Link>
            <Link href="/dashboard/withdraw" className="link-accent text-sm self-center">
              Start another withdrawal
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
