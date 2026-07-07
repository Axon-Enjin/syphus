import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const TESTNET_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

describe("fetchPayments", () => {
  beforeEach(() => {
    vi.stubEnv("STELLAR_NETWORK", "testnet");
    vi.stubEnv("USDC_ISSUER", TESTNET_ISSUER);
    vi.stubEnv("HORIZON_URL", "https://horizon-testnet.stellar.org");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("filters USDC inbound payments and extracts memo", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _embedded: {
          records: [
            {
              id: "1",
              type: "payment",
              asset_type: "credit_alphanum4",
              asset_code: "USDC",
              asset_issuer: TESTNET_ISSUER,
              from: "GSENDER",
              to: "GRECEIVER",
              amount: "500",
              transaction_hash: "txhash1",
              created_at: "2026-01-15T00:00:00Z",
              transaction_successful: true,
              transaction_memo: "INV-001",
              paging_token: "cursor1",
            },
            {
              id: "2",
              type: "payment",
              asset_type: "native",
              from: "GXLM",
              to: "GRECEIVER",
              amount: "10",
              transaction_hash: "txhash2",
              created_at: "2026-01-16T00:00:00Z",
              paging_token: "cursor2",
            },
          ],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { fetchPayments } = await import("./index");
    const { records, nextCursor } = await fetchPayments("GRECEIVER");

    expect(records).toHaveLength(1);
    expect(records[0].amount).toBe("500");
    expect(records[0].memo).toBe("INV-001");
    expect(nextCursor).toBe("cursor2");
  });

  it("throws on Horizon error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );

    const { fetchPayments } = await import("./index");
    await expect(fetchPayments("GMISSING")).rejects.toThrow("Horizon error");
  });
});
