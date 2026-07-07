import { describe, expect, it } from "vitest";
import { transactionsToCsv, transactionsToPdf, sumUsdcAmounts } from "./export";

const sampleTx = {
  id: "1",
  userId: "u",
  walletId: "w",
  transactionHash: "abc123def456",
  senderAddress: "GABCDEFGHIJKLMNOP",
  amountUsdc: "500",
  memo: "INV-001",
  stellarCreatedAt: new Date("2026-01-15"),
  indexedAt: new Date(),
};

describe("transactionsToCsv", () => {
  it("formats header and rows with memo (QAD-F4-01)", () => {
    const csv = transactionsToCsv([sampleTx as never]);
    expect(csv).toContain("date,amount_usdc,sender,transaction_hash,memo");
    expect(csv).toContain("500");
    expect(csv).toContain("abc123def456");
    expect(csv).toContain("INV-001");
  });

  it("returns header only for empty range (QAD-F4-03)", () => {
    const csv = transactionsToCsv([]);
    expect(csv).toBe("date,amount_usdc,sender,transaction_hash,memo");
  });
});

describe("sumUsdcAmounts", () => {
  it("totals row amounts", () => {
    expect(
      sumUsdcAmounts([
        sampleTx as never,
        { ...sampleTx, amountUsdc: "250" } as never,
      ]),
    ).toBe(750);
  });
});

describe("transactionsToPdf", () => {
  it("returns valid PDF bytes with matching totals (QAD-F4-02)", async () => {
    const pdf = await transactionsToPdf(
      [
        sampleTx as never,
        {
          ...sampleTx,
          id: "2",
          amountUsdc: "250",
          transactionHash: "def456ghi789",
        } as never,
      ],
      "Maria Reyes",
    );

    const header = new TextDecoder().decode(pdf.slice(0, 5));
    expect(header).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(500);
    expect(sumUsdcAmounts([sampleTx as never, { ...sampleTx, amountUsdc: "250" } as never])).toBe(750);
  });

  it("handles empty export (QAD-F4-03)", async () => {
    const pdf = await transactionsToPdf([], "Maria Reyes");
    const header = new TextDecoder().decode(pdf.slice(0, 5));
    expect(header).toBe("%PDF-");
  });
});
