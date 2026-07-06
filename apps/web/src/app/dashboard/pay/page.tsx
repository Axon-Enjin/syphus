"use client";

import { useState } from "react";
import { createPaymentLink } from "@/app/actions/payments";
import { Nav, Card, Button, Input } from "@/components/ui";

export default function PayLinkPage() {
  const [result, setResult] = useState<{
    checkoutUrl: string;
    sep7Uri: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const res = await createPaymentLink(new FormData(e.currentTarget));
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("ok" in res && res.ok) {
      setResult({ checkoutUrl: res.checkoutUrl, sep7Uri: res.sep7Uri });
    }
  }

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-xl space-y-6 p-6">
        <Card title="Generate payment link (PRD-F2)">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <Input name="label" placeholder="Invoice label (optional)" />
            <Input name="amountUsdc" placeholder="Amount USDC (optional)" />
            <Input name="memo" placeholder="Memo (optional, max 28)" maxLength={28} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit">Create link</Button>
          </form>
          {result && (
            <div className="mt-4 space-y-2 rounded-lg bg-[#fafaf8] p-4 text-sm">
              <p>
                Checkout:{" "}
                <a className="text-[#0D6E4F]" href={result.checkoutUrl}>
                  {result.checkoutUrl}
                </a>
              </p>
              <p className="mono break-all text-xs">{result.sep7Uri}</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
