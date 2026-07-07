import type { AnchorProvider, WithdrawParams, WithdrawSession } from "./types";

export class BCRemitAnchorProvider implements AnchorProvider {
  id = "bcremit" as const;
  private transferServer: string;

  constructor(transferServer?: string) {
    this.transferServer =
      transferServer ??
      process.env.BCREMIT_TRANSFER_SERVER ??
      "https://api.bcremit.com/stellar";
  }

  async getToml() {
    return { transferServer: this.transferServer };
  }

  async startWithdrawal(params: WithdrawParams): Promise<WithdrawSession> {
    const res = await fetch(
      `${this.transferServer}/transactions/withdraw/interactive`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_code: "USDC",
          account: params.destinationAccount,
          amount: params.amountUsdc,
          type: "bank_account",
          success_callback_url: params.callbackUrl,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`BCRemit SEP-24 start failed: ${res.status}`);
    }

    const data = (await res.json()) as { id?: string; url?: string };
    if (!data.id || !data.url) {
      throw new Error("BCRemit SEP-24 response missing id or url");
    }

    return { id: data.id, url: data.url };
  }

  async getWithdrawalStatus(id: string) {
    const res = await fetch(`${this.transferServer}/transaction/${id}`);
    if (!res.ok) {
      return "failed" as const;
    }
    const data = (await res.json()) as { status?: string };
    if (data.status === "completed") return "completed";
    if (data.status === "error" || data.status === "failed") return "failed";
    return "pending";
  }

  async healthCheck() {
    if (!process.env.BCREMIT_TRANSFER_SERVER) {
      return "down" as const;
    }

    try {
      const res = await fetch(`${this.transferServer}/`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      return res.ok ? ("healthy" as const) : ("degraded" as const);
    } catch {
      return "down" as const;
    }
  }
}
