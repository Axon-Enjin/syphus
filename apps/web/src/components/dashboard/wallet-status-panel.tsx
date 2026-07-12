import Link from "next/link";
import { AddressDisplay } from "@/components/ui-interactive";
import { KycStatusCard } from "@/components/kyc-status-card";
import { WalletFreighterLink } from "@/components/dashboard/wallet-freighter-link";

interface WalletStatusPanelProps {
  publicKey: string;
  trustlineReady: boolean;
  anchorKycComplete: boolean;
  isExternal: boolean;
}

export function WalletStatusPanel({
  publicKey,
  trustlineReady,
  anchorKycComplete,
  isExternal,
}: WalletStatusPanelProps) {
  return (
    <section className="surface-card space-y-4 p-6">
      <div>
        <p className="text-eyebrow mb-1">Wallet</p>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Payment address
        </h2>
      </div>

      <AddressDisplay address={publicKey} />

      <div className="flex items-center gap-2 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${
            trustlineReady
              ? "bg-[var(--color-success)]"
              : "status-dot-breathe bg-[var(--color-warning)]"
          }`}
          aria-hidden="true"
        />
        <span className="text-[var(--color-muted)]">
          USDC:{" "}
          <span
            className={
              trustlineReady
                ? "font-medium text-[var(--color-success)]"
                : "font-medium text-[var(--color-warning)]"
            }
          >
            {trustlineReady ? "Ready" : "Setup required"}
          </span>
        </span>
        {!trustlineReady && (
          <Link href="/dashboard/onboard" className="link-accent text-sm">
            Finish setup
          </Link>
        )}
      </div>

      <KycStatusCard complete={anchorKycComplete} compact />

      <WalletFreighterLink
        currentPublicKey={publicKey}
        isExternal={isExternal}
      />
    </section>
  );
}
