"use client";

import { useState } from "react";
import { startWithdrawal } from "@/app/actions/withdraw";
import {
  Card,
  FieldLabel,
  Input,
  StepIndicator,
  type StepStatus,
} from "@/components/ui";
import { LoadingButton } from "@/components/ui-interactive";
import { formatPhpApprox } from "@/lib/php-display";

export function WithdrawForm({ disabled = false }: { disabled?: boolean }) {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const phpPreview =
    amount.trim() && !isNaN(parseFloat(amount))
      ? formatPhpApprox(amount)
      : null;

  function stepStatus(index: number): StepStatus {
    if (index < activeStep) return "done";
    if (index === activeStep) return "active";
    return "pending";
  }

  const steps = [
    { label: "Enter amount", status: stepStatus(0) },
    { label: "Verify identity", status: stepStatus(1) },
    { label: "Receive PHP", status: stepStatus(2) },
  ];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setActiveStep(1);

    const res = await startWithdrawal(new FormData(e.currentTarget));

    setLoading(false);

    if ("error" in res && res.error) {
      setError(res.error);
      setActiveStep(0);
      return;
    }
    if ("ok" in res && res.ok) {
      setActiveStep(2);
      setRedirectUrl(res.redirectUrl);
      window.open(res.redirectUrl, "_blank");
    }
  }

  return (
    <Card title="Withdraw USDC">
      <StepIndicator steps={steps} orientation="horizontal" />

      <p className="mb-6 mt-6 text-sm text-[var(--color-muted)]">
        You will complete bank details and identity checks with our anchor
        partner in a secure window.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <FieldLabel htmlFor="amountUsdc">Amount USDC</FieldLabel>
          <Input
            id="amountUsdc"
            name="amountUsdc"
            placeholder="e.g. 250"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {phpPreview && (
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              Approx. {phpPreview.php} {phpPreview.label} to your bank
            </p>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <LoadingButton
          type="submit"
          loading={loading}
          loadingLabel="Starting withdrawal…"
          disabled={disabled}
        >
          Start withdrawal
        </LoadingButton>
      </form>

      {redirectUrl && (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          Anchor session opened:{" "}
          <a className="link-accent" href={redirectUrl}>
            Continue in new tab
          </a>
        </p>
      )}
    </Card>
  );
}
