"use client";

import { AddressDisplay, CopyButton } from "@/components/ui-interactive";
import { Sep7Qr } from "@/components/sep7-qr";

export interface PublicCheckoutProps {
  userName: string | null;
  label: string | null;
  amountUsdc: string | null;
  memo: string | null;
  publicKey: string;
  sep7Uri: string;
}

export function PublicCheckout({
  userName,
  label,
  amountUsdc,
  memo,
  publicKey,
  sep7Uri,
}: PublicCheckoutProps) {
  const displayName = userName ?? label ?? "Contractor";
  const amountLabel = amountUsdc ? `${amountUsdc} USDC` : "Any amount";

  return (
    <main className="container-app max-w-lg space-y-6 py-12 md:py-16">
      <div>
        <p className="text-eyebrow">Pay with USDC</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Pay {displayName}
        </h1>
        <p className="font-display mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          {amountLabel}
        </p>
      </div>

      <div className="callout-warning p-4 text-sm">
        Send on the <strong>Stellar network</strong> only. Payments on the wrong
        network cannot be recovered.
      </div>

      <div className="surface-card flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
        <Sep7Qr uri={sep7Uri} />
        <div className="flex-1 space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">
              Payment address
            </p>
            <AddressDisplay address={publicKey} />
          </div>
          {memo && (
            <div className="surface-inset p-3">
              <p className="text-xs font-medium text-[var(--color-muted)]">
                Include this memo
              </p>
              <p className="mono mt-1 text-sm">{memo}</p>
              <div className="mt-2">
                <CopyButton text={memo} label="Copy memo" />
              </div>
            </div>
          )}
        </div>
      </div>

      <a href={sep7Uri} className="btn-primary focus-ring block py-3 text-center">
        Open in Stellar wallet
      </a>
    </main>
  );
}
