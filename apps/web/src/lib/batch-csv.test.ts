import { describe, expect, it } from "vitest";
import { parseBatchCsv, sumBatchAmounts } from "./batch-csv";

const VALID_ADDRESS =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

describe("parseBatchCsv", () => {
  it("parses valid CSV rows", () => {
    const csv = `name,stellar_address,amount_usdc,memo
Maria Reyes,${VALID_ADDRESS},500,INV-001
John Doe,${VALID_ADDRESS},250,`;

    const result = parseBatchCsv(csv);
    expect(result.errors).toBeUndefined();
    expect(result.rows).toHaveLength(2);
    expect(result.rows![0].recipientName).toBe("Maria Reyes");
    expect(result.rows![0].amountUsdc).toBe("500");
  });

  it("rejects missing required headers", () => {
    const result = parseBatchCsv("email,amount\na@b.com,10");
    expect(result.errors?.[0]).toMatch(/header/i);
  });

  it("rejects invalid Stellar address", () => {
    const csv = `name,stellar_address,amount_usdc
Bad,not-an-address,10`;
    const result = parseBatchCsv(csv);
    expect(result.errors?.[0]).toMatch(/invalid Stellar address/i);
  });

  it("rejects invalid amount", () => {
    const csv = `name,stellar_address,amount_usdc
Maria,${VALID_ADDRESS},-5`;
    const result = parseBatchCsv(csv);
    expect(result.errors?.[0]).toMatch(/invalid amount/i);
  });
});

describe("sumBatchAmounts", () => {
  it("totals row amounts", () => {
    expect(
      sumBatchAmounts([
        {
          recipientName: "A",
          destinationAddress: VALID_ADDRESS,
          amountUsdc: "100",
        },
        {
          recipientName: "B",
          destinationAddress: VALID_ADDRESS,
          amountUsdc: "50.5",
        },
      ]),
    ).toBe("150.5");
  });
});
