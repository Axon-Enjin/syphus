"use client";

import { useState } from "react";
import {
  setupTrustline,
  verifyTrustline,
  buildTrustlineXdr,
} from "@/app/actions/auth";
import { LoadingButton, ProgressSteps } from "@/components/ui-interactive";
import type { ProgressStepStatus } from "@/components/ui-interactive";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TrustlineCheckProps {
  isExternal: boolean;
  horizonUrl: string;
  networkPassphrase: string;
  onSuccess?: () => void;
}

const FREIGHTER_STEPS = [
  "Preparing transaction",
  "Approve in Freighter",
  "Submitting to Stellar",
  "Verifying trustline",
] as const;

const AUTO_STEPS = [
  "Preparing wallet",
  "Enabling USDC on Stellar",
  "Verifying trustline",
] as const;

function buildProgress(
  labels: readonly string[],
  activeIndex: number,
): { label: string; status: ProgressStepStatus }[] {
  return labels.map((label, i) => ({
    label,
    status:
      i < activeIndex ? "done" : i === activeIndex ? "active" : "pending",
  }));
}

async function verifyWithRetry(maxAttempts = 6, delayMs = 2000) {
  let last = await verifyTrustline();
  if (last.ready) return last;
  if (last.error === "Not authenticated" || last.error === "No wallet found") {
    return last;
  }

  for (let i = 1; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));
    last = await verifyTrustline();
    if (last.ready) return last;
    if (last.error === "Not authenticated" || last.error === "No wallet found") {
      return last;
    }
  }
  return last;
}

export function TrustlineCheck({
  isExternal,
  horizonUrl,
  networkPassphrase,
  onSuccess,
}: TrustlineCheckProps) {
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { update } = useSession();
  const router = useRouter();

  async function completeTrustline() {
    setActiveStep(isExternal ? 3 : 2);
    const verifyResult = await verifyWithRetry();
    if (!verifyResult.ready) {
      setError(
        verifyResult.error ??
          "Trustline not detected yet. If you already signed in Freighter, click “Verify USDC trustline” below.",
      );
      setLoading(false);
      return;
    }
    // Unlock middleware: JWT must learn trustlineReady before /dashboard links work
    await update({ trustlineReady: true });
    onSuccess?.();
    router.refresh();
    setLoading(false);
  }

  async function handleVerifyOnly() {
    setLoading(true);
    setError(null);
    try {
      await completeTrustline();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  }

  async function handleFreighterSign() {
    setLoading(true);
    setError(null);
    setActiveStep(0);

    try {
      const { xdr, error: buildError } = await buildTrustlineXdr();
      if (buildError || !xdr) {
        setError(buildError ?? "Failed to build transaction");
        setLoading(false);
        return;
      }

      setActiveStep(1);
      const { isConnected } = await import("@stellar/freighter-api").then(
        (m) => m.isConnected(),
      );

      if (!isConnected) {
        setError("Freighter not detected. Please install the extension.");
        setLoading(false);
        return;
      }

      const { signTransaction } = await import("@stellar/freighter-api");
      const { signedTxXdr, error: signError } = await signTransaction(xdr, {
        networkPassphrase,
      });

      if (signError) {
        setError(signError.message ?? "Transaction signing rejected");
        setLoading(false);
        return;
      }

      setActiveStep(2);
      const res = await fetch(`${horizonUrl}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `tx=${encodeURIComponent(signedTxXdr)}`,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const detail =
          data?.extras?.result_codes?.operations?.[0] ??
          data?.detail ??
          "Submission failed";
        setError(`Transaction failed: ${detail}`);
        setLoading(false);
        return;
      }

      await completeTrustline();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  async function handleInternalSetup() {
    setLoading(true);
    setError(null);
    setActiveStep(0);

    try {
      setActiveStep(1);
      const result = await setupTrustline();

      if (!result.ok) {
        setError(result.error ?? "Failed to enable USDC");
        setLoading(false);
        return;
      }

      await completeTrustline();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  const stepLabels = isExternal ? FREIGHTER_STEPS : AUTO_STEPS;

  if (isExternal) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-muted)]">
          Sign a transaction in Freighter to enable USDC on your wallet. Make
          sure Freighter is set to <strong>Testnet</strong> and this account has
          testnet XLM for fees.
        </p>
        <LoadingButton
          onClick={handleFreighterSign}
          loading={loading}
          loadingLabel="Working…"
        >
          Enable USDC with Freighter
        </LoadingButton>
        <button
          type="button"
          onClick={handleVerifyOnly}
          disabled={loading}
          className="btn-secondary focus-ring w-full disabled:opacity-50"
        >
          Verify USDC trustline
        </button>
        {loading && (
          <ProgressSteps steps={buildProgress(stepLabels, activeStep)} />
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
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-muted)]">
        We&apos;ll enable USDC on your wallet automatically. This may take a
        few seconds.
      </p>
      <LoadingButton
        onClick={handleInternalSetup}
        loading={loading}
        loadingLabel="Enabling USDC…"
      >
        Enable USDC
      </LoadingButton>
      {loading && (
        <ProgressSteps steps={buildProgress(stepLabels, activeStep)} />
      )}
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
