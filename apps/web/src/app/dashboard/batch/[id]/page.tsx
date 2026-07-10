import { notFound } from "next/navigation";
import { getBatchDetail } from "@/app/actions/batch";
import { BatchReconciliation } from "@/components/dashboard/batch-reconciliation";
import { PageHeader } from "@/components/ui";
import { getBatchOnChain, isSorobanEnabled } from "@syphus/stellar";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getBatchDetail(id);

  if ("error" in result) {
    notFound();
  }

  const onChainBatch =
    isSorobanEnabled()
      ? await getBatchOnChain(result.batch.id).catch(() => null)
      : null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title={result.batch.name}
        description="Open each SEP-7 link from your treasury wallet, then mark rows as sent."
      />
      <BatchReconciliation
        batch={result.batch}
        items={result.items}
        onChainBatch={onChainBatch}
      />
    </div>
  );
}
