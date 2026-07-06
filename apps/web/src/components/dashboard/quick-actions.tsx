import Link from "next/link";

const actions = [
  {
    href: "/dashboard/pay",
    label: "Create payment link",
    description: "Send a link to your client",
  },
  {
    href: "/dashboard/withdraw",
    label: "Withdraw to bank",
    description: "Convert USDC to PHP",
  },
  {
    href: "/dashboard/export",
    label: "Export income",
    description: "CSV or PDF for records",
  },
];

export function QuickActions() {
  return (
    <section className="space-y-3">
      <p className="text-eyebrow">Quick actions</p>
      <ul className="space-y-2">
        {actions.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="focus-ring group flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg)] active:scale-[0.99]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {action.label}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {action.description}
                </p>
              </div>
              <span
                className="text-[var(--color-muted)] transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
