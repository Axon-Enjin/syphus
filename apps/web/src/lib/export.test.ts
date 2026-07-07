import { describe, expect, it } from "vitest";
import { transactionsToCsv, transactionsToPdfHtml } from "./export";

const sampleTx = {
  id: "1",
  userId: "u",
  walletId: "w",
  transactionHash: "abc123",
  senderAddress: "GABC",
  amountUsdc: "500",
  memo: "INV-001",
  stellarCreatedAt: new Date("2026-01-15"),
  indexedAt: new Date(),
};

describe("transactionsToCsv", () => {
  it("formats header and rows with memo", () => {
    const csv = transactionsToCsv([sampleTx as never]);
    expect(csv).toContain("date,amount_usdc,sender,transaction_hash,memo");
    expect(csv).toContain("500");
    expect(csv).toContain("abc123");
    expect(csv).toContain("INV-001");
  });

  it("returns header only for empty range", () => {
    const csv = transactionsToCsv([]);
    expect(csv).toBe("date,amount_usdc,sender,transaction_hash,memo");
  });
});

describe("transactionsToPdfHtml", () => {
  it("includes summary total matching row sum", () => {
    const html = transactionsToPdfHtml(
      [
        sampleTx as never,
        {
          ...sampleTx,
          id: "2",
          amountUsdc: "250",
          transactionHash: "def456",
        } as never,
      ],
      "Maria Reyes",
    );
    expect(html).toContain("Maria Reyes");
    expect(html).toContain("Total USDC: 750.00");
    expect(html).toContain("abc123");
    expect(html).toContain("def456");
  });

  it("handles empty export", () => {
    const html = transactionsToPdfHtml([], "Maria Reyes");
    expect(html).toContain("Total USDC: 0.00");
  });
});
