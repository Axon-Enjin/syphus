import { auth } from "@/lib/auth";
import { getTransactionsInRange } from "@/lib/indexer";
import { Card, PageHeader } from "@/components/ui";
import { ExportPanel } from "@/components/dashboard/export-panel";

function sumUsdc(amounts: string[]): string {
  const total = amounts.reduce((sum, a) => sum + (parseFloat(a) || 0), 0);
  return total.toFixed(7).replace(/\.?0+$/, "") || "0";
}

export default async function ExportPage() {
  const session = await auth();
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 6);

  const txs = await getTransactionsInRange(session!.user!.id, from, to);
  const totalUsdc = sumUsdc(txs.map((tx) => tx.amountUsdc));

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        title="Income export"
        description="Download your on-chain USDC receipts for tax or accounting."
      />
      <Card title="Export payments">
        <p className="mb-6 text-sm text-[var(--color-muted)]">
          Exports include date, amount, sender address, and transaction hash
          for each confirmed payment.
        </p>
        <ExportPanel paymentCount={txs.length} totalUsdc={totalUsdc} />
      </Card>
    </div>
  );
}
