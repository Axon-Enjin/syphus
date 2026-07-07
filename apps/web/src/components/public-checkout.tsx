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
  stellarNetwork?: "testnet" | "public";
}

export function PublicCheckout({
  userName,
  label,
  amountUsdc,
  memo,
  publicKey,
  sep7Uri,
  stellarNetwork = "testnet",
}: PublicCheckoutProps) {
  const displayName = userName ?? label ?? "Contractor";
  const amountLabel = amountUsdc ? `${amountUsdc} USDC` : "Any amount";
  const networkLabel =
    stellarNetwork === "public" ? "Stellar mainnet" : "Stellar testnet";
  const explorerBase =
    stellarNetwork === "public"
      ? "https://stellar.expert/explorer/public"
      : "https://stellar.expert/explorer/testnet";

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

      <div className="callout-warning space-y-2 p-4 text-sm">
        <p>
          Send on <strong>{networkLabel}</strong> only. Payments on Ethereum,
          Polygon, or other networks cannot be recovered.
        </p>
        <ul className="list-inside list-disc space-y-1 text-[var(--color-muted)]">
          <li>Asset: USDC (not XLM or other tokens)</li>
          <li>Destination: address below</li>
          {memo && (
            <li>
              Memo: required — must match exactly or payment may be lost
            </li>
          )}
        </ul>
      </div>

      {memo && (
        <div className="surface-card border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">
            Required memo
          </p>
          <p className="mono mt-2 text-lg font-medium">{memo}</p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Your wallet must include this memo when sending. A wrong or missing
            memo can delay or lose the payment.
          </p>
          <div className="mt-3">
            <CopyButton text={memo} label="Copy memo" />
          </div>
        </div>
      )}

      <div className="surface-card flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
        <Sep7Qr uri={sep7Uri} />
        <div className="flex-1 space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">
              Payment address ({networkLabel})
            </p>
            <AddressDisplay address={publicKey} />
          </div>
          <a
            href={`${explorerBase}/account/${publicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent text-xs"
          >
            View address on explorer
          </a>
        </div>
      </div>

      <a href={sep7Uri} className="btn-primary focus-ring block py-3 text-center">
        Open in Stellar wallet
      </a>
    </main>
  );
}
