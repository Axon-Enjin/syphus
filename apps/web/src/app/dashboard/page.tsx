import { auth } from "@/lib/auth";
import { getUserTransactions, getUserWallet } from "@/lib/indexer";
import { Nav, Card } from "@/components/ui";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const wallet = await getUserWallet(userId);
  const txs = await getUserTransactions(userId);

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-[#6B6B63]">
            Payment history and wallet status
          </p>
        </div>

        <Card title="Your Stellar address">
          {wallet ? (
            <div className="space-y-2">
              <code className="mono block break-all text-sm">
                {wallet.publicKey}
              </code>
              <p className="text-sm">
                Trustline:{" "}
                <span
                  className={
                    wallet.trustlineReady ? "text-[#047857]" : "text-[#B45309]"
                  }
                >
                  {wallet.trustlineReady ? "Ready" : "Setup required"}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm">No wallet found.</p>
          )}
        </Card>

        <Card title="Recent payments">
          {txs.length === 0 ? (
            <p className="text-sm text-[#6B6B63]">
              No payments indexed yet. Share your payment link with a client.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[#6B6B63]">
                  <th className="py-2">Date</th>
                  <th>USDC</th>
                  <th>Sender</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#f0f0ec]">
                    <td className="py-2">
                      {tx.stellarCreatedAt.toISOString().slice(0, 10)}
                    </td>
                    <td>{tx.amountUsdc}</td>
                    <td className="mono">{tx.senderAddress.slice(0, 12)}...</td>
                    <td className="text-[#047857]">Confirmed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </main>
    </div>
  );
}
