"use client";

import { formatPhpApprox } from "@/lib/php-display";

interface PayPreviewProps {
  label: string;
  amountUsdc: string;
  memo: string;
  freelancerName?: string;
}

export function PayPreview({
  label,
  amountUsdc,
  memo,
  freelancerName = "Your name",
}: PayPreviewProps) {
  const displayAmount = amountUsdc.trim() || "—";
  const phpDisplay =
    amountUsdc.trim() && !isNaN(parseFloat(amountUsdc))
      ? formatPhpApprox(amountUsdc)
      : null;

  return (
    <div className="surface-card sticky top-8 p-6 lg:p-8">
      <p className="text-eyebrow mb-4">Client preview</p>
      <div className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <p className="text-xs text-[var(--color-muted)]">
              {label.trim() || "Payment"}
            </p>
            <p className="font-display text-lg font-semibold tracking-tight">
              {freelancerName}
            </p>
          </div>
          <div className="text-right">
            {phpDisplay && (
              <p className="font-display text-2xl font-semibold tracking-tight">
                {phpDisplay.php}
              </p>
            )}
            <p className="text-sm text-[var(--color-muted)]">
              {displayAmount} USDC
            </p>
            {phpDisplay && (
              <p className="text-xs text-[var(--color-muted)]">
                {phpDisplay.label}
              </p>
            )}
          </div>
        </div>
        {memo.trim() && (
          <div className="surface-inset p-3">
            <p className="text-xs text-[var(--color-muted)]">Memo</p>
            <p className="mono text-sm">{memo}</p>
          </div>
        )}
        <p className="text-xs text-[var(--color-muted)]">
          Your client opens this link and pays on the Stellar network.
        </p>
      </div>
    </div>
  );
}
