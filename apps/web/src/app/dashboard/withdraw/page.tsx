import { auth } from "@/lib/auth";
import { getUserWallet, getTransactionsInRange } from "@/lib/indexer";
import { Card, PageHeader } from "@/components/ui";
import { KycStatusCard } from "@/components/kyc-status-card";
import { WithdrawForm } from "./withdraw-form";

function sumUsdc(amounts: string[]): string {
  const total = amounts.reduce((sum, a) => sum + (parseFloat(a) || 0), 0);
  return total.toFixed(7).replace(/\.?0+$/, "") || "0";
}

export default async function WithdrawPage() {
  const session = await auth();
  const wallet = await getUserWallet(session!.user!.id);
  const kycComplete = wallet?.anchorKycComplete ?? false;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <PageHeader
        title="Withdraw to bank"
        description="Convert USDC to local currency via our anchor partner."
      />

      {!kycComplete ? (
        <Card title="Identity verification required">
          <KycStatusCard complete={false} />
        </Card>
      ) : (
        <WithdrawForm />
      )}
    </div>
  );
}
