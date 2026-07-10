import Link from "next/link";
import { PublicLayout } from "@/components/public-layout";
import { Card, StepIndicator } from "@/components/ui";

const howItWorksSteps = [
  { label: "Create account", status: "done" as const },
  { label: "Get your payment address", status: "done" as const },
  { label: "Enable USDC", status: "done" as const },
  { label: "Receive payments", status: "active" as const },
];

const valueProps = [
  {
    title: "Receive USDC",
    detail: "Share a payment link. Clients pay on Stellar; you see it in seconds.",
    metric: "30s",
    metricLabel: "to confirm",
  },
  {
    title: "Withdraw to bank",
    detail: "Convert to PHP through our anchor partner. Payouts land same day.",
    metric: "PHP",
    metricLabel: "to GCash or bank",
  },
  {
    title: "Export income",
    detail: "Payment history builds automatically. CSV or PDF for tax records.",
    metric: "6mo",
    metricLabel: "export range",
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <div className="container-app py-16 md:py-24">
        {/* Hero: asymmetric split */}
        <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <p className="text-eyebrow">Syphus</p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--color-text)] md:text-5xl">
              USDC payroll for your PH team. One link. PHP today.
            </h1>
            <p className="text-body-muted">
              Built for crypto-native payers who already hold USDC. Invoice
              links, same-day bank withdrawals, and income history that builds
              itself.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/register" className="btn-primary focus-ring">
                Get started
              </Link>
              <Link href="/login" className="btn-secondary focus-ring">
                Sign in
              </Link>
            </div>
          </div>

          {/* Proof panel: payment preview mock */}
          <div className="surface-card p-6 lg:p-8">
            <p className="text-eyebrow mb-4">Live preview</p>
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-4">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Pay</p>
                  <p className="font-display text-lg font-semibold tracking-tight">
                    Maria Reyes
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-semibold tracking-tight">
                    500
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">USDC</p>
                </div>
              </div>
              <div className="surface-inset p-3">
                <p className="text-xs text-[var(--color-muted)]">
                  Stellar address
                </p>
                <p className="mono mt-1 break-all text-xs text-[var(--color-text)]">
                  GBDU3J...K4L2M9
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                Payment confirmed
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20 md:mt-28">
          <div className="mb-6 max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              How it works
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Four steps from signup to your first payment.
            </p>
          </div>
          <Card title="Your setup path">
            <StepIndicator steps={howItWorksSteps} orientation="vertical" />
          </Card>
        </section>

        {/* Value props: stacked list, not 3-column cards */}
        <section className="mt-20 md:mt-28">
          <div className="mb-6 max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Built for freelancers
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Everything Maria needs from payment to proof of income.
            </p>
          </div>
          <div className="surface-card divide-y divide-[var(--color-border)] overflow-hidden">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8"
              >
                <div>
                  <h3 className="font-display font-semibold tracking-tight text-[var(--color-text)]">
                    {prop.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                    {prop.detail}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-display text-2xl font-semibold tracking-tight text-[var(--color-accent)]">
                    {prop.metric}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {prop.metricLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-16 text-center text-sm text-[var(--color-muted)]">
          Built for crypto-native teams paying PH contractors. Not another
          remittance app for fiat senders.
        </p>

        <section className="surface-card mt-12 p-8 text-center md:p-12">
          <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
            Ready to get paid in USDC?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
            Set up takes a few minutes. No crypto experience required on your
            side.
          </p>
          <Link href="/register" className="btn-primary focus-ring mt-6">
            Get started
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
}
