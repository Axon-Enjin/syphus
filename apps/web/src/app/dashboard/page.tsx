import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserTransactions, getUserWallet } from "@/lib/indexer";
import { PageHeader } from "@/components/ui";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { PaymentRow } from "@/components/dashboard/payment-row";
import { FadeInList } from "@/components/dashboard/fade-in-list";
import { EmptyPayments } from "@/components/dashboard/empty-payments";
import { WalletStatusPanel } from "@/components/dashboard/wallet-status-panel";
import { QuickActions } from "@/components/dashboard/quick-actions";

function sumUsdc(amounts: string[]): string {
  const total = amounts.reduce((sum, a) => sum + (parseFloat(a) || 0), 0);
  return total.toFixed(7).replace(/\.?0+$/, "") || "0";
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const email = session!.user!.email ?? "there";
  const wallet = await getUserWallet(userId);
  const txs = await getUserTransactions(userId);

  const totalUsdc = sumUsdc(txs.map((tx) => tx.amountUsdc));
  const showWelcome = wallet?.trustlineReady && txs.length === 0;
  const greeting = email.includes("@") ? email.split("@")[0] : email;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${greeting}`}
        description="Payment history and wallet status"
      />

      <DashboardSummary
        totalUsdc={totalUsdc}
        paymentCount={txs.length}
        trustlineReady={wallet?.trustlineReady ?? false}
      />

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Recent payments
            </h2>
            {txs.length > 0 && (
              <span className="text-xs text-[var(--color-muted)]">
                {txs.length} total
              </span>
            )}
          </div>

          {txs.length === 0 ? (
            <EmptyPayments />
          ) : (
            <FadeInList>
              {txs.map((tx) => (
                <PaymentRow
                  key={tx.id}
                  date={tx.stellarCreatedAt.toISOString().slice(0, 10)}
                  amountUsdc={tx.amountUsdc}
                  senderAddress={tx.senderAddress}
                  transactionHash={tx.transactionHash}
                />
              ))}
            </FadeInList>
          )}
        </section>

        <aside className="space-y-6">
          {showWelcome && wallet && (
            <div className="surface-card border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-6">
              <p className="font-display text-sm font-semibold text-[var(--color-success)]">
                You are ready to receive payments
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Share a payment link with your client. Payments appear on the
                left within about 30 seconds.
              </p>
              <Link
                href="/dashboard/pay"
                className="btn-primary focus-ring mt-4 inline-flex"
              >
                Create payment link
              </Link>
            </div>
          )}

          {wallet && (
            <WalletStatusPanel
              publicKey={wallet.publicKey}
              trustlineReady={wallet.trustlineReady}
              anchorKycComplete={wallet.anchorKycComplete}
            />
          )}

          <QuickActions />
        </aside>
      </div>
    </div>
  );
}
