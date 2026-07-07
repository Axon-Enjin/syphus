import { auth } from "@/lib/auth";
import { getTransactionsInRange } from "@/lib/indexer";
import { Card, PageHeader } from "@/components/ui";
import {
  ExportPanel,
  type ExportMonthRange,
  type ExportRangeStats,
} from "@/components/dashboard/export-panel";

function sumUsdc(amounts: string[]): string {
  const total = amounts.reduce((sum, a) => sum + (parseFloat(a) || 0), 0);
  return total.toFixed(7).replace(/\.?0+$/, "") || "0";
}

async function statsForMonths(
  userId: string,
  months: ExportMonthRange,
): Promise<ExportRangeStats> {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  const txs = await getTransactionsInRange(userId, from, to);
  return {
    paymentCount: txs.length,
    totalUsdc: sumUsdc(txs.map((tx) => tx.amountUsdc)),
  };
}

export default async function ExportPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const ranges: ExportMonthRange[] = [1, 3, 6, 12];
  const entries = await Promise.all(
    ranges.map(async (m) => [m, await statsForMonths(userId, m)] as const),
  );
  const statsByMonths = Object.fromEntries(entries) as Record<
    ExportMonthRange,
    ExportRangeStats
  >;

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
        <ExportPanel statsByMonths={statsByMonths} />
      </Card>
    </div>
  );
}
