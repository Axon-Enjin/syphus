"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/components/ui";
import { AddressDisplay } from "@/components/ui-interactive";
import { TrustlineCheck } from "./trustline-check";

type StepId = 1 | 2 | 3;
type StepStatus = "done" | "active" | "pending";

interface WalletSetupProps {
  publicKey: string | null;
  trustlineReady: boolean;
  anchorKycComplete: boolean;
  isExternal: boolean;
  isMockAnchor: boolean;
  horizonUrl: string;
  networkPassphrase: string;
}

const STEP_LABELS = [
  "Payment address",
  "Enable USDC",
  "Ready to receive",
] as const;

function initialStep(
  hasAddress: boolean,
  trustlineReady: boolean,
): StepId {
  if (trustlineReady) return 3;
  if (hasAddress) return 2;
  return 1;
}

function stepStatuses(activeStep: StepId): StepStatus[] {
  return STEP_LABELS.map((_, i) => {
    const n = i + 1;
    if (n < activeStep) return "done";
    if (n === activeStep) return "active";
    return "pending";
  });
}

function ProgressRail({
  statuses,
}: {
  activeStep: StepId;
  statuses: StepStatus[];
}) {
  return (
    <ol className="onboard-rail" aria-label="Setup steps">
      {STEP_LABELS.map((label, i) => {
        const status = statuses[i];
        const stepNum = (i + 1) as StepId;
        return (
          <li
            key={label}
            className={`onboard-rail__item onboard-rail__item--${status}`}
            aria-current={status === "active" ? "step" : undefined}
          >
            <span className="onboard-rail__marker" aria-hidden="true">
              {status === "done" ? (
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                  <path
                    d="M3 8l3.5 3.5L13 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                stepNum
              )}
            </span>
            <span className="onboard-rail__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function MobileProgress({
  activeStep,
  statuses,
}: {
  activeStep: StepId;
  statuses: StepStatus[];
}) {
  return (
    <div className="onboard-mobile-progress md:hidden" aria-label="Setup progress">
      <div className="onboard-mobile-progress__segments" role="presentation">
        {statuses.map((status, i) => (
          <span
            key={i}
            className={`onboard-mobile-progress__segment onboard-mobile-progress__segment--${status}`}
          />
        ))}
      </div>
      <p className="onboard-mobile-progress__label">
        Step {activeStep} of 3 · {STEP_LABELS[activeStep - 1]}
      </p>
    </div>
  );
}

export function WalletSetup({
  publicKey,
  trustlineReady: initialTrustlineReady,
  anchorKycComplete,
  isExternal,
  isMockAnchor: _isMockAnchor,
  horizonUrl,
  networkPassphrase,
}: WalletSetupProps) {
  const hasAddress = !!publicKey;
  const router = useRouter();
  const { update } = useSession();
  const [trustlineReady, setTrustlineReady] = useState(initialTrustlineReady);
  const [activeStep, setActiveStep] = useState<StepId>(() =>
    initialStep(hasAddress, initialTrustlineReady),
  );
  const [navigating, setNavigating] = useState(false);
  const [navError, setNavError] = useState<string | null>(null);

  useEffect(() => {
    if (trustlineReady) {
      setActiveStep(3);
    }
  }, [trustlineReady]);

  // Middleware reads trustlineReady from the JWT. Sync it when step 3 is shown
  // so Continue links aren't bounced back to /dashboard/onboard.
  useEffect(() => {
    if (activeStep !== 3 || !trustlineReady) return;
    void update({ trustlineReady: true });
  }, [activeStep, trustlineReady, update]);

  const statuses = stepStatuses(activeStep);

  function handleTrustlineSuccess() {
    setTrustlineReady(true);
    setActiveStep(3);
  }

  function handleContinueFromAddress() {
    if (hasAddress) setActiveStep(2);
  }

  async function goTo(path: string) {
    setNavigating(true);
    setNavError(null);
    try {
      await update({ trustlineReady: true });
      router.push(path);
      router.refresh();
    } catch {
      setNavError("Could not unlock the dashboard. Please try again.");
      setNavigating(false);
    }
  }

  return (
    <div className="onboard-flow">
      <MobileProgress activeStep={activeStep} statuses={statuses} />

      <div className="onboard-flow__layout">
        <aside className="onboard-flow__rail hidden md:block">
          <p className="text-eyebrow mb-4">Wallet setup</p>
          <h1 className="font-display mb-2 text-2xl font-semibold tracking-tight">
            Get paid in USDC
          </h1>
          <p className="mb-8 text-sm text-[var(--color-muted)]">
            A few steps so clients can send you payments on Stellar.
          </p>
          <ProgressRail activeStep={activeStep} statuses={statuses} />
        </aside>

        <div className="onboard-flow__panel">
          <div
            key={activeStep}
            className="onboard-step-panel surface-card animate-fade-up"
          >
            {activeStep === 1 && (
              <>
                <p className="text-eyebrow md:hidden">Step 1 of 3</p>
                <h2 className="font-display mt-2 text-xl font-semibold tracking-tight md:mt-0 md:text-2xl">
                  Your payment address
                </h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Clients send USDC to this Stellar address. Copy it when you
                  invoice or share a payment link.
                </p>
                {publicKey ? (
                  <div className="mt-6">
                    <AddressDisplay address={publicKey} />
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-[var(--color-muted)]">
                    No wallet found. Please contact support.
                  </p>
                )}
                <div className="onboard-step-panel__actions onboard-step-panel__actions--inline mt-8 hidden md:block">
                  <button
                    type="button"
                    onClick={handleContinueFromAddress}
                    disabled={!hasAddress}
                    className="btn-primary focus-ring w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {activeStep === 2 && (
              <>
                <p className="text-eyebrow md:hidden">Step 2 of 3</p>
                <h2 className="font-display mt-2 text-xl font-semibold tracking-tight md:mt-0 md:text-2xl">
                  Enable USDC
                </h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  USDC is the digital dollar your clients send. Enabling it on
                  your wallet lets you receive those payments.
                </p>
                <div className="mt-6">
                  <TrustlineCheck
                    isExternal={isExternal}
                    horizonUrl={horizonUrl}
                    networkPassphrase={networkPassphrase}
                    onSuccess={handleTrustlineSuccess}
                  />
                </div>
              </>
            )}

            {activeStep === 3 && (
              <>
                <p className="text-eyebrow md:hidden">Step 3 of 3</p>
                <h2 className="font-display mt-2 text-xl font-semibold tracking-tight md:mt-0 md:text-2xl">
                  You&apos;re all set
                </h2>
                <div className="mt-4">
                  <StatusBadge variant="success">
                    Your wallet is ready to receive USDC
                  </StatusBadge>
                </div>
                <p className="mt-4 text-sm text-[var(--color-muted)]">
                  Head to your dashboard or create a payment link to start
                  getting paid.
                </p>
                <div className="onboard-step-panel__actions onboard-step-panel__actions--inline mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => goTo("/dashboard")}
                    disabled={navigating}
                    className="btn-primary focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {navigating ? "Opening…" : "Continue to dashboard"}
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo("/dashboard/pay")}
                    disabled={navigating}
                    className="btn-secondary focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Create payment link
                  </button>
                </div>
                {navError && (
                  <p className="mt-3 text-sm text-red-700" role="alert">
                    {navError}
                  </p>
                )}
                {!anchorKycComplete && (
                  <p className="mt-8 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted)]">
                    Bank withdrawals need identity verification. You&apos;ll
                    complete that during your first withdrawal — receiving USDC
                    does not require it.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {activeStep === 1 && hasAddress && (
        <div className="onboard-sticky-cta md:hidden">
          <button
            type="button"
            onClick={handleContinueFromAddress}
            className="btn-primary focus-ring w-full"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
