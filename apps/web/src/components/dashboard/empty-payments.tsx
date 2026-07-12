import Link from "next/link";

export function EmptyPayments() {
  return (
    <div className="border-t border-[var(--color-border)] py-12 text-center">
      <p className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)]">
        No inbound USDC yet
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-muted)]">
        Only USDC sent to your linked payment address appears here. Share a
        payment link with clients, then click Refresh to sync from Stellar.
      </p>
      <Link href="/dashboard/pay" className="btn-primary focus-ring mt-6 inline-flex">
        Create payment link
      </Link>
    </div>
  );
}
