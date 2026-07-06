"use client";

import { useState } from "react";
import { startWithdrawal } from "@/app/actions/withdraw";
import { Nav, Card, Button, Input } from "@/components/ui";

export default function WithdrawPage() {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const res = await startWithdrawal(new FormData(e.currentTarget));
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("ok" in res && res.ok) {
      setRedirectUrl(res.redirectUrl);
      window.open(res.redirectUrl, "_blank");
    }
  }

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-xl space-y-6 p-6">
        <Card title="Off-ramp to PHP (PRD-F3)">
          <p className="mb-4 text-sm text-[#6B6B63]">
            Starts SEP-24 flow via active anchor provider (mock in dev).
          </p>
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <Input name="amountUsdc" placeholder="Amount USDC" required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit">Start withdrawal</Button>
          </form>
          {redirectUrl && (
            <p className="mt-4 text-sm">
              Anchor session opened:{" "}
              <a className="text-[#0D6E4F]" href={redirectUrl}>
                Continue
              </a>
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}
