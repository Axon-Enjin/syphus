import Link from "next/link";

export function EmptyPayments() {
  return (
    <div className="border-t border-[var(--color-border)] py-12 text-center">
      <p className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)]">
        No payments yet
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-muted)]">
        Share a payment link with your client. Confirmed payments appear here
        within about 30 seconds.
      </p>
      <Link href="/dashboard/pay" className="btn-primary focus-ring mt-6 inline-flex">
        Create payment link
      </Link>
    </div>
  );
}
