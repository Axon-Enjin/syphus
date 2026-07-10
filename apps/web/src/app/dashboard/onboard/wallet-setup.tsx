"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, StepIndicator, StatusBadge, PageHeader } from "@/components/ui";
import { AddressDisplay } from "@/components/ui-interactive";
import { KycStatusCard } from "@/components/kyc-status-card";
import { MockKycButton } from "@/app/dashboard/withdraw/mock-kyc-button";
import { TrustlineCheck } from "./trustline-check";

interface WalletSetupProps {
  publicKey: string | null;
  trustlineReady: boolean;
  anchorKycComplete: boolean;
  isExternal: boolean;
  isMockAnchor: boolean;
  horizonUrl: string;
  networkPassphrase: string;
}

export function WalletSetup({
  publicKey,
  trustlineReady: initialTrustlineReady,
  anchorKycComplete,
  isExternal,
  isMockAnchor,
  horizonUrl,
  networkPassphrase,
}: WalletSetupProps) {
  const [trustlineReady, setTrustlineReady] = useState(initialTrustlineReady);

  const hasAddress = !!publicKey;

  // Three core setup steps. Identity verification is deferred to the first
  // withdrawal, so it is shown as a separate "later" section, not a step here.
  const steps = [
    { label: "Account created", status: "done" as const },
    {
      label: "Payment address",
      status: hasAddress ? ("done" as const) : ("active" as const),
    },
    {
      label: "Enable USDC",
      status: trustlineReady
        ? ("done" as const)
        : hasAddress
          ? ("active" as const)
          : ("pending" as const),
    },
  ];

  function handleTrustlineSuccess() {
    setTrustlineReady(true);
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        title="Wallet setup"
        description="A few steps so clients can pay you in USDC."
      />

      {trustlineReady && (
        <Card title="You're all set">
          <div className="space-y-4">
            <StatusBadge variant="success">
              Your wallet is ready to receive USDC
            </StatusBadge>
            <p className="text-sm text-[var(--color-muted)]">
              Head to your dashboard or share a payment link to start getting
              paid.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-primary focus-ring">
                Continue to dashboard
              </Link>
              <Link href="/dashboard/pay" className="btn-secondary focus-ring">
                Create payment link
              </Link>
            </div>
          </div>
        </Card>
      )}

      <Card title="Your setup progress">
        <StepIndicator steps={steps} orientation="vertical" />
      </Card>

      <Card title="Your payment address">
        {publicKey ? (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-muted)]">
              Share this address with clients who pay you in USDC on Stellar.
            </p>
            <AddressDisplay address={publicKey} />
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            No wallet found. Please contact support.
          </p>
        )}
      </Card>

      <Card title="Enable USDC">
        {trustlineReady ? (
          <StatusBadge variant="success">
            You can receive USDC payments
          </StatusBadge>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-muted)]">
              USDC is the digital dollar your clients send. Enabling it on your
              wallet lets you receive those payments.
            </p>
            <TrustlineCheck
              isExternal={isExternal}
              horizonUrl={horizonUrl}
              networkPassphrase={networkPassphrase}
              onSuccess={handleTrustlineSuccess}
            />
          </div>
        )}
      </Card>

      <Card title="Identity verification (later)">
        <div className="space-y-3">
          <KycStatusCard complete={anchorKycComplete} />
          {isMockAnchor && !anchorKycComplete && <MockKycButton />}
        </div>
      </Card>
    </div>
  );
}
