export type AnchorHealth = "healthy" | "degraded" | "down";

export interface WithdrawParams {
  amountUsdc: string;
  destinationAccount: string;
  callbackUrl: string;
}

export interface WithdrawSession {
  id: string;
  url: string;
}

export type WithdrawStatus = "pending" | "completed" | "failed";

export interface AnchorProvider {
  id: "mock" | "coinsph" | "bcremit";
  getToml(): Promise<{ transferServer: string }>;
  startWithdrawal(params: WithdrawParams): Promise<WithdrawSession>;
  getWithdrawalStatus(id: string): Promise<WithdrawStatus>;
  healthCheck(): Promise<AnchorHealth>;
}
