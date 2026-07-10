import { beforeEach, describe, expect, it, vi } from "vitest";

const selectLimit = vi.fn();
const updateWhere = vi.fn();
const markLinkPaid = vi.fn();
const isSorobanEnabled = vi.fn();

vi.mock("@gig-payout/db", () => ({
  eq: (a: unknown, b: unknown) => ({ a, b }),
  or: (...args: unknown[]) => ({ or: args }),
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: selectLimit,
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: updateWhere,
      }),
    }),
  }),
  paymentLinks: {
    id: "id",
    slug: "slug",
    memo: "memo",
    onChainStatus: "on_chain_status",
  },
}));

vi.mock("@gig-payout/stellar", () => ({
  isSorobanEnabled: () => isSorobanEnabled(),
  markLinkPaid: (...args: unknown[]) => markLinkPaid(...args),
}));

describe("settlePaymentLinkOnChain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSorobanEnabled.mockReturnValue(true);
    updateWhere.mockResolvedValue(undefined);
  });

  it("skips when Soroban is disabled", async () => {
    isSorobanEnabled.mockReturnValue(false);
    const { settlePaymentLinkOnChain } = await import("./soroban-settlement");
    const result = await settlePaymentLinkOnChain("abc123", "txhash");
    expect(result.settled).toBe(false);
    expect(markLinkPaid).not.toHaveBeenCalled();
  });

  it("marks paid when memo matches registered link slug", async () => {
    selectLimit.mockResolvedValue([
      {
        id: "link-1",
        slug: "abc123def4567890",
        memo: "abc123def4567890",
        onChainStatus: "registered",
      },
    ]);
    markLinkPaid.mockResolvedValue({ ok: true, txHash: "soroban-tx" });

    const { settlePaymentLinkOnChain } = await import("./soroban-settlement");
    const result = await settlePaymentLinkOnChain(
      "abc123def4567890",
      "horizon-tx",
    );

    expect(result).toEqual({ settled: true, slug: "abc123def4567890" });
    expect(markLinkPaid).toHaveBeenCalledWith({
      slug: "abc123def4567890",
      txHash: "horizon-tx",
    });
    expect(updateWhere).toHaveBeenCalled();
  });

  it("does not mark when link is only skipped", async () => {
    selectLimit.mockResolvedValue([
      {
        id: "link-2",
        slug: "skippedlink00001",
        memo: "skippedlink00001",
        onChainStatus: "skipped",
      },
    ]);

    const { settlePaymentLinkOnChain } = await import("./soroban-settlement");
    const result = await settlePaymentLinkOnChain(
      "skippedlink00001",
      "horizon-tx",
    );

    expect(result.settled).toBe(false);
    expect(markLinkPaid).not.toHaveBeenCalled();
  });
});
