import Link from "next/link";
import { formatPhpApprox } from "@/lib/php-display";
import { getStellarExplorerBase } from "@/lib/stellar-explorer";

interface PaymentRowProps {
  date: string;
  amountUsdc: string;
  senderAddress: string;
  transactionHash: string;
  status?: "confirmed" | "pending";
}

export function PaymentRow({
  date,
  amountUsdc,
  senderAddress,
  transactionHash,
  status = "confirmed",
}: PaymentRowProps) {
  const { php, label } = formatPhpApprox(amountUsdc);
  const horizonBase = getStellarExplorerBase();

  return (
    <article className="payment-row">
      <time
        dateTime={date}
        className="text-xs text-[var(--color-muted)] sm:text-sm"
      >
        {date}
      </time>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-display text-xl font-semibold tracking-tight text-[var(--color-text)]">
            {php}
          </span>
          <span className="text-xs text-[var(--color-muted)]">{label}</span>
        </div>
        <p className="mt-0.5 text-sm text-[var(--color-muted)]">
          {amountUsdc} USDC
        </p>
        <p className="mono mt-1 truncate text-xs text-[var(--color-muted)]">
          {senderAddress.slice(0, 16)}...
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 sm:items-end">
        {status === "confirmed" ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-success)]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]"
              aria-hidden="true"
            />
            Confirmed
          </span>
        ) : (
          <span className="callout-warning inline-flex items-center gap-1.5 px-2 py-0.5 text-xs">
            <span
              className="status-dot-breathe h-1.5 w-1.5 rounded-full bg-[var(--color-warning)]"
              aria-hidden="true"
            />
            Pending
          </span>
        )}
        <a
          href={`${horizonBase}/tx/${transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent text-xs"
        >
          View tx
        </a>
      </div>
    </article>
  );
}
