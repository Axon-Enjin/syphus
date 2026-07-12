"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { linkFreighterWallet } from "@/app/actions/auth";
import { syncMyPayments } from "@/app/actions/sync";
import { FreighterConnect } from "@/components/freighter-connect";
import { StatusBadge } from "@/components/ui";

interface WalletFreighterLinkProps {
  currentPublicKey: string;
  isExternal: boolean;
}

export function WalletFreighterLink({
  currentPublicKey,
  isExternal,
}: WalletFreighterLinkProps) {
  const router = useRouter();
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedKey, setLinkedKey] = useState<string | null>(null);

  const showLinked =
    isExternal || (linkedKey !== null && linkedKey === currentPublicKey);

  async function handleConnect(address: string) {
    setLinking(true);
    setError(null);

    const linkResult = await linkFreighterWallet(address);
    if (linkResult.error) {
      setError(linkResult.error);
      setLinking(false);
      return;
    }

    await syncMyPayments();
    setLinkedKey(address);
    router.refresh();
    setLinking(false);
  }

  if (showLinked) {
    return (
      <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
        <StatusBadge variant="success">Linked via Freighter</StatusBadge>
        <p className="text-xs text-[var(--color-muted)]">
          Payment links and incoming USDC use this Freighter address. Reconnect
          below to switch accounts.
        </p>
        <FreighterConnect
          onConnect={handleConnect}
          connected={currentPublicKey}
        />
        {linking && (
          <p className="text-xs text-[var(--color-muted)]">Updating wallet…</p>
        )}
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
      <p className="text-sm font-medium text-[var(--color-text)]">
        Link Freighter wallet
      </p>
      <p className="text-xs text-[var(--color-muted)]">
        Use your Freighter account as your payment address. Clients must send to
        this address — switching replaces your current Syphus-managed address.
      </p>
      <FreighterConnect onConnect={handleConnect} connected={null} />
      {linking && (
        <p className="text-xs text-[var(--color-muted)]">Linking wallet…</p>
      )}
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
