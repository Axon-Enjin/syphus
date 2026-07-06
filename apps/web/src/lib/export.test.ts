import { describe, expect, it } from "vitest";
import { transactionsToCsv } from "./export";

describe("transactionsToCsv", () => {
  it("formats header and rows", () => {
    const csv = transactionsToCsv([
      {
        id: "1",
        userId: "u",
        walletId: "w",
        transactionHash: "abc123",
        senderAddress: "GABC",
        amountUsdc: "500",
        memo: "INV",
        stellarCreatedAt: new Date("2026-01-15"),
        indexedAt: new Date(),
      },
    ] as never);
    expect(csv).toContain("date,amount_usdc,sender,transaction_hash,memo");
    expect(csv).toContain("500");
    expect(csv).toContain("abc123");
  });
});
