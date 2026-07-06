import { Nav, Card } from "@/components/ui";

export default function ExportPage() {
  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-xl space-y-6 p-6">
        <Card title="Income export (PRD-F4)">
          <p className="mb-4 text-sm text-[#6B6B63]">
            Download your last 6 months of on-chain USDC receipts.
          </p>
          <div className="flex gap-3">
            <a
              href="/api/export?format=csv&months=6"
              className="rounded-lg bg-[#0D6E4F] px-4 py-2 text-sm font-medium text-white"
            >
              Download CSV
            </a>
            <a
              href="/api/export?format=pdf&months=6"
              className="rounded-lg border border-[#d4d4ce] px-4 py-2 text-sm"
            >
              Download PDF (HTML)
            </a>
          </div>
        </Card>
      </main>
    </div>
  );
}
