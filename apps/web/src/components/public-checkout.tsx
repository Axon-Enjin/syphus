"use client";

import { useMemo, useState } from "react";
import { AddressDisplay, CopyButton } from "@/components/ui-interactive";
import { Sep7Qr } from "@/components/sep7-qr";
import { buildCheckoutPaymentXdr } from "@/app/actions/checkout";
import { explainCheckoutPayError } from "@/lib/checkout-pay-errors";

export interface PublicCheckoutProps {
  userName: string | null;
  label: string | null;
  amountUsdc: string | null;
  memo: string | null;
  publicKey: string;
  sep7Uri: string;
  stellarNetwork?: "testnet" | "public";
  horizonUrl: string;
  networkPassphrase: string;
  verifiedOnChain?: boolean;
  registeredOnChain?: boolean;
  registerTxHash?: string | null;
  paidTxHash?: string | null;
}

export function PublicCheckout({
  userName,
  label,
  amountUsdc,
  memo,
  publicKey,
  sep7Uri,
  stellarNetwork = "testnet",
  horizonUrl,
  networkPassphrase,
  verifiedOnChain = false,
  registeredOnChain = false,
  registerTxHash,
  paidTxHash,
}: PublicCheckoutProps) {
  const displayName = userName ?? label ?? "Contractor";
  const amountLabel = amountUsdc ? `${amountUsdc} USDC` : "Any amount";
  const networkLabel =
    stellarNetwork === "public" ? "Stellar mainnet" : "Stellar testnet";
  const explorerBase =
    stellarNetwork === "public"
      ? "https://stellar.expert/explorer/public"
      : "https://stellar.expert/explorer/testnet";

  const [customAmount, setCustomAmount] = useState(amountUsdc ?? "");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paidHash, setPaidHash] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  const payAmount = amountUsdc ?? customAmount.trim();
  const payErrorInfo = useMemo(
    () =>
      payError
        ? explainCheckoutPayError(payError, {
            network: stellarNetwork,
            amount: payAmount || amountUsdc || undefined,
          })
        : null,
    [payError, stellarNetwork, payAmount, amountUsdc],
  );

  async function payWithFreighter() {
    setPaying(true);
    setPayError(null);

    try {
      if (!payAmount || Number(payAmount) <= 0) {
        setPayError("Enter how much USDC to send.");
        setPaying(false);
        return;
      }

      const freighter = await import("@stellar/freighter-api");
      const { isConnected } = await freighter.isConnected();
      if (!isConnected) {
        setPayError(
          "Freighter not detected. Install the extension, or use the manual steps below.",
        );
        setPaying(false);
        return;
      }

      const { address, error: accessError } = await freighter.requestAccess();
      if (accessError || !address) {
        setPayError(accessError?.message ?? "Freighter access denied");
        setPaying(false);
        return;
      }

      const { xdr, error: buildError } = await buildCheckoutPaymentXdr({
        sourcePublicKey: address,
        destination: publicKey,
        amount: payAmount,
        memo,
      });

      if (buildError || !xdr) {
        setPayError(buildError ?? "Could not prepare the payment");
        setPaying(false);
        return;
      }

      const { signedTxXdr, error: signError } = await freighter.signTransaction(
        xdr,
        { networkPassphrase },
      );

      if (signError || !signedTxXdr) {
        setPayError(signError?.message ?? "Payment signing cancelled");
        setPaying(false);
        return;
      }

      const res = await fetch(`${horizonUrl}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `tx=${encodeURIComponent(signedTxXdr)}`,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const opCode = data?.extras?.result_codes?.operations?.[0];
        const txCode = data?.extras?.result_codes?.transaction;
        const detail =
          (typeof opCode === "string" && opCode) ||
          (typeof txCode === "string" && txCode) ||
          data?.detail ||
          "Submission failed";
        setPayError(typeof detail === "string" ? detail : "Submission failed");
        setPaying(false);
        return;
      }

      const data = (await res.json()) as { hash?: string };
      setPaidHash(data.hash ?? "submitted");
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  if (paidHash || verifiedOnChain) {
    const hash = paidHash ?? paidTxHash;
    return (
      <main className="container-app max-w-lg space-y-6 py-12 md:py-16">
        <div>
          <p className="text-eyebrow">Payment sent</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
            Thanks — USDC is on the way
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            {displayName} will see this payment once it confirms on Stellar.
          </p>
        </div>
        <div className="surface-card border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-5">
          <p className="text-sm font-medium">
            {amountLabel} · {networkLabel}
          </p>
          {hash && hash !== "submitted" && (
            <a
              href={`${explorerBase}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent mt-3 inline-block text-sm"
            >
              View transaction on explorer
            </a>
          )}
        </div>
      </main>
    );
  }

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

      {registeredOnChain && (
        <div className="surface-card p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">
            Registered on Stellar
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Invoice attested on-chain via Soroban PaymentRegistry. Awaiting
            payment.
          </p>
          {registerTxHash && (
            <a
              href={`${explorerBase}/tx/${registerTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent mt-2 inline-block text-xs"
            >
              View registration on explorer
            </a>
          )}
        </div>
      )}

      <div className="callout-warning space-y-2 p-4 text-sm">
        <p>
          Send on <strong>{networkLabel}</strong> only — USDC on Stellar, not
          Ethereum or other chains.
        </p>
        {memo && (
          <p>
            Include memo <strong className="mono">{memo}</strong> exactly, or the
            payment may not be matched.
          </p>
        )}
      </div>

      {/* Primary: Freighter in-browser pay */}
      <div className="surface-card space-y-4 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Pay in this browser
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Best with the Freighter extension. Approves amount
            {memo ? ", memo," : ""} and destination for you.
          </p>
        </div>

        {!amountUsdc && (
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--color-muted)]">
              Amount (USDC)
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="10"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus-ring"
            />
          </label>
        )}

        <button
          type="button"
          onClick={payWithFreighter}
          disabled={paying}
          className="btn-primary focus-ring w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {paying ? "Waiting for Freighter…" : "Pay with Freighter"}
        </button>

        {payErrorInfo && (
          <div
            className="callout-warning space-y-0 p-4"
            role="alert"
          >
            <p className="text-sm font-medium text-[var(--color-text)]">
              {payErrorInfo.title}
            </p>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              {payErrorInfo.body}
            </p>
            {payErrorInfo.actions && payErrorInfo.actions.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-4">
                {payErrorInfo.actions.map((action) => (
                  <li key={action.href}>
                    <a
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-accent text-sm"
                    >
                      {action.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setShowManual(true)}
              className="link-accent mt-3 text-sm"
            >
              Pay manually instead
            </button>
          </div>
        )}

        <p className="text-xs text-[var(--color-muted)]">
          No Freighter?{" "}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            Install Freighter
          </a>
          {" · "}
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="link-accent"
          >
            Pay manually instead
          </button>
        </p>
      </div>

      {/* Memo + address — always visible for clarity */}
      {memo && (
        <div className="surface-card border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">
                Required memo
              </p>
              <p className="mono mt-2 text-lg font-medium">{memo}</p>
            </div>
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
          {amountUsdc && (
            <div className="flex items-center gap-2">
              <p className="text-sm">
                Amount: <strong>{amountUsdc} USDC</strong>
              </p>
              <CopyButton text={amountUsdc} label="Copy amount" />
            </div>
          )}
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

      {/* Manual / SEP-7 fallback */}
      <div className="surface-card space-y-4 p-6">
        <button
          type="button"
          onClick={() => setShowManual((v) => !v)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={showManual}
        >
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Other ways to pay
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Mobile wallets, Coinbase, or copy-paste
            </p>
          </div>
          <span className="text-[var(--color-muted)]" aria-hidden="true">
            {showManual ? "−" : "+"}
          </span>
        </button>

        {showManual && (
          <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted)]">
              <li>
                Open a Stellar wallet set to <strong>{networkLabel}</strong>
              </li>
              <li>
                Send <strong>USDC</strong>
                {amountUsdc ? (
                  <>
                    {" "}
                    for <strong>{amountUsdc}</strong>
                  </>
                ) : null}{" "}
                to the address above
              </li>
              {memo && (
                <li>
                  Paste memo <strong className="mono">{memo}</strong> exactly
                </li>
              )}
              <li>Confirm and wait for the transaction to clear</li>
            </ol>

            <a
              href={sep7Uri}
              className="btn-secondary focus-ring block py-3 text-center"
            >
              Try wallet deep link
            </a>
            <p className="text-xs text-[var(--color-muted)]">
              Deep links (`web+stellar:`) only work if your wallet registered
              that protocol — many desktop browsers ignore them. Prefer Freighter
              above, or copy the address and memo into your wallet app.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
