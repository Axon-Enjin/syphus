import type { AnchorProvider, WithdrawParams, WithdrawSession } from "./types";

const sessions = new Map<string, "pending" | "completed">();

export class MockAnchorProvider implements AnchorProvider {
  id = "mock" as const;

  async getToml() {
    return { transferServer: "https://mock.anchor.test/sep24" };
  }

  async startWithdrawal(params: WithdrawParams): Promise<WithdrawSession> {
    const id = `mock-${Date.now()}`;
    sessions.set(id, "pending");
    return {
      id,
      url: `https://mock.anchor.test/withdraw/${id}?amount=${params.amountUsdc}`,
    };
  }

  async getWithdrawalStatus(id: string) {
    return sessions.get(id) === "completed" ? "completed" : "pending";
  }

  async healthCheck() {
    return "healthy" as const;
  }

  /** Test helper */
  completeSession(id: string) {
    sessions.set(id, "completed");
  }
}
