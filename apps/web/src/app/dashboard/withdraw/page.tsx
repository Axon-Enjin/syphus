import {
  getOffRampStatus,
  isOffRampPaused,
} from "@syphus/anchors";
import { auth } from "@/lib/auth";
import { getUserWallet } from "@/lib/indexer";
import { Card, PageHeader } from "@/components/ui";
import { KycStatusCard } from "@/components/kyc-status-card";
import { MockKycButton } from "./mock-kyc-button";
import { WithdrawForm } from "./withdraw-form";

export default async function WithdrawPage() {
  const session = await auth();
  const wallet = await getUserWallet(session!.user!.id);
  const kycComplete = wallet?.anchorKycComplete ?? false;
  const trustlineReady = wallet?.trustlineReady ?? false;
  const offRampPaused = isOffRampPaused();
  const offRampStatus = getOffRampStatus();
  const isMockAnchor = process.env.ANCHOR_PROVIDER === "mock";

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <PageHeader
        title="Withdraw to bank"
        description="Convert USDC to local currency via our anchor partner."
      />

      {offRampPaused && (
        <div className="callout-warning p-4 text-sm" role="alert">
          <p className="font-medium">Off-ramp temporarily paused</p>
          <p className="mt-1 opacity-90">
            Both anchor partners are unavailable right now. You can still receive USDC payments.
            Withdrawals will reopen automatically when a partner recovers.
          </p>
        </div>
      )}

      {!offRampPaused && offRampStatus.activeProvider !== offRampStatus.primaryProvider && (
        <div className="callout-warning p-4 text-sm">
          <p>
            Primary anchor is down. Withdrawals are routing through{" "}
            <span className="font-medium">{offRampStatus.activeProvider}</span> until service
            recovers.
          </p>
        </div>
      )}

      {!trustlineReady ? (
        <Card title="Complete wallet setup first">
          <p className="text-sm text-[var(--color-muted)]">
            Add a USDC trustline before withdrawing.{" "}
            <a href="/dashboard/onboard" className="link-accent">
              Finish setup
            </a>
          </p>
        </Card>
      ) : (
        <>
          {!kycComplete && (
            <Card title="Identity verification required">
              <KycStatusCard complete={false} />
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Your first withdrawal opens the anchor KYC flow. Until that
                completes, bank payouts stay pending at the partner. Receiving
                USDC is unaffected.
              </p>
              {isMockAnchor && (
                <div className="mt-4">
                  <MockKycButton />
                </div>
              )}
            </Card>
          )}
          {kycComplete && <KycStatusCard complete />}
          <WithdrawForm disabled={offRampPaused} />
        </>
      )}
    </div>
  );
}
