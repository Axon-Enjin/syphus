import Link from "next/link";
import { sumPhpApprox } from "@/lib/php-display";

interface DashboardSummaryProps {
  totalUsdc: string;
  paymentCount: number;
  trustlineReady: boolean;
}

export function DashboardSummary({
  totalUsdc,
  paymentCount,
  trustlineReady,
}: DashboardSummaryProps) {
  const { php, label } = sumPhpApprox([totalUsdc]);

  return (
    <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
      <div className="surface-card p-6">
        <p className="text-eyebrow mb-2">Received</p>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-3xl font-semibold tracking-tight">
            {php}
          </span>
          <span className="text-sm text-[var(--color-muted)]">{label}</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {totalUsdc} USDC across {paymentCount} payment
          {paymentCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="surface-card flex flex-col justify-between p-6">
        <div>
          <p className="text-eyebrow mb-2">Status</p>
          <p className="font-display text-lg font-semibold tracking-tight">
            {trustlineReady ? "Ready to receive" : "Setup required"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {trustlineReady
              ? "Share a payment link with your client."
              : "Finish wallet setup to unlock payments."}
          </p>
        </div>
        {!trustlineReady && (
          <Link
            href="/dashboard/onboard"
            className="link-accent mt-4 text-sm font-medium"
          >
            Complete setup
          </Link>
        )}
      </div>
    </div>
  );
}
