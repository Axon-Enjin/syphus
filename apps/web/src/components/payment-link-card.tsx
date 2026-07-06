"use client";

import Link from "next/link";
import { CopyButton, useToast } from "@/components/ui-interactive";
import { Sep7Qr } from "@/components/sep7-qr";

interface PaymentLinkCardProps {
  checkoutUrl: string;
  sep7Uri: string;
}

export function PaymentLinkCard({ checkoutUrl, sep7Uri }: PaymentLinkCardProps) {
  const { showToast } = useToast();

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Payment link",
          text: "Pay me in USDC on Stellar",
          url: checkoutUrl,
        });
        return;
      } catch {
        // cancelled or failed
      }
    }
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      showToast("Link copied");
    } catch {
      showToast("Could not copy link");
    }
  }

  return (
    <div className="surface-card mt-6 space-y-4 p-6">
      <p className="font-display text-sm font-semibold tracking-tight">
        Your payment link
      </p>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Sep7Qr uri={sep7Uri} label="Client scans to pay" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="mb-1 text-xs text-[var(--color-muted)]">
              Checkout page
            </p>
            <a
              href={checkoutUrl}
              className="link-accent break-all text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              {checkoutUrl}
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={checkoutUrl} label="Copy link" />
            <button
              type="button"
              onClick={handleShare}
              className="btn-secondary focus-ring px-3 py-1.5 text-xs active:scale-[0.98]"
            >
              Share
            </button>
          </div>
          <p className="mono break-all text-xs text-[var(--color-muted)]">
            {sep7Uri}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TrustlineGate() {
  return (
    <div className="callout-warning p-4 text-sm">
      <p>
        Finish wallet setup before creating payment links. Clients cannot send
        USDC until your trustline is active.
      </p>
      <Link href="/dashboard/onboard" className="link-accent mt-2 inline-block font-medium">
        Complete wallet setup
      </Link>
    </div>
  );
}
