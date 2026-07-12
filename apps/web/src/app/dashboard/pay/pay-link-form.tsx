"use client";

import { useState } from "react";
import { createPaymentLink } from "@/app/actions/payments";
import { Card, Input, PageHeader, FieldLabel } from "@/components/ui";
import { LoadingButton } from "@/components/ui-interactive";
import {
  PaymentLinkCard,
  TrustlineGate,
} from "@/components/payment-link-card";
import { PayPreview } from "@/components/dashboard/pay-preview";

interface PayLinkFormProps {
  trustlineReady: boolean;
  freelancerName: string;
}

export function PayLinkForm({
  trustlineReady,
  freelancerName,
}: PayLinkFormProps) {
  const [result, setResult] = useState<{
    checkoutUrl: string;
    sep7Uri: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [label, setLabel] = useState("");
  const [amountUsdc, setAmountUsdc] = useState("");
  const [memo, setMemo] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);

    const res = await createPaymentLink(new FormData(e.currentTarget));

    setLoading(false);

    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("ok" in res && res.ok) {
      setResult({ checkoutUrl: res.checkoutUrl, sep7Uri: res.sep7Uri });
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payment link"
        description="Create a link your client can use to pay you in USDC."
      />

      {!trustlineReady ? (
        <Card title="Setup required">
          <TrustlineGate />
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <Card title="Generate payment link">
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div>
                  <FieldLabel htmlFor="label">
                    Invoice label (optional)
                  </FieldLabel>
                  <Input
                    id="label"
                    name="label"
                    placeholder="e.g. March retainer"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="amountUsdc">
                    Amount USDC (optional)
                  </FieldLabel>
                  <Input
                    id="amountUsdc"
                    name="amountUsdc"
                    placeholder="e.g. 500"
                    value={amountUsdc}
                    onChange={(e) => setAmountUsdc(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="memo">
                    Memo (optional, max 28 chars)
                  </FieldLabel>
                  <Input
                    id="memo"
                    name="memo"
                    placeholder="e.g. INV-001"
                    maxLength={28}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-700" role="alert">
                    {error}
                  </p>
                )}
                <LoadingButton
                  type="submit"
                  loading={loading}
                  loadingLabel="Creating link…"
                >
                  Create link
                </LoadingButton>
              </form>
            </Card>

            {result && (
              <div className="mt-6">
                <p className="text-eyebrow mb-2">Your link</p>
                <PaymentLinkCard
                  checkoutUrl={result.checkoutUrl}
                  sep7Uri={result.sep7Uri}
                />
              </div>
            )}
          </div>

          <PayPreview
            label={label}
            amountUsdc={amountUsdc}
            memo={memo}
            freelancerName={freelancerName}
          />
        </div>
      )}
    </div>
  );
}
