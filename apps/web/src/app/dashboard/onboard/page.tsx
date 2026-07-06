import { auth } from "@/lib/auth";
import { getUserWallet } from "@/lib/indexer";
import { markTrustlineReady } from "@/app/actions/auth";
import { Nav, Card, Button } from "@/components/ui";

export default async function OnboardPage() {
  const session = await auth();
  const wallet = await getUserWallet(session!.user!.id);

  async function confirmTrustline() {
    "use server";
    const s = await auth();
    if (!s?.user?.id) return;
    await markTrustlineReady(s.user.id);
  }

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-xl space-y-6 p-6">
        <Card title="Wallet setup (PRD-F1)">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>Fund your Stellar account with testnet XLM (friendbot).</li>
            <li>Add USDC trustline in Freighter or Lobstr.</li>
            <li>Confirm below once trustline is active.</li>
          </ol>
          {wallet && (
            <code className="mono mt-4 block break-all rounded bg-[#fafaf8] p-3 text-xs">
              {wallet.publicKey}
            </code>
          )}
          <form action={confirmTrustline} className="mt-4">
            <Button type="submit">Mark trustline ready</Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
