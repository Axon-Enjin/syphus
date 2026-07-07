import { describe, expect, it, vi, beforeEach } from "vitest";

const mockFetchPayments = vi.fn();
const mockInsertReturning = vi.fn();
const mockInsertOnConflict = vi.fn();
const mockInsertValues = vi.fn();
const mockInsert = vi.fn();
const mockCursorUpsert = vi.fn();
const mockSelectFrom = vi.fn();
const mockSelect = vi.fn();

vi.mock("@gig-payout/stellar", () => ({
  fetchPayments: (...args: unknown[]) => mockFetchPayments(...args),
}));

vi.mock("@gig-payout/db", () => ({
  getDb: () => ({
    select: mockSelect,
    insert: mockInsert,
  }),
  wallets: { id: "id" },
  transactions: { id: "id", transactionHash: "transaction_hash" },
  indexerCursors: { walletId: "wallet_id" },
}));

describe("indexAllWallets", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSelect.mockReturnValue({ from: mockSelectFrom });
    mockSelectFrom
      .mockResolvedValueOnce([
        {
          id: "wallet-1",
          userId: "user-1",
          publicKey: "GRECEIVER",
        },
      ])
      .mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      });

    mockInsert.mockReturnValue({ values: mockInsertValues });
    mockInsertValues.mockReturnValue({
      onConflictDoUpdate: mockCursorUpsert,
      onConflictDoNothing: mockInsertOnConflict,
    });
    mockInsertOnConflict.mockReturnValue({
      returning: mockInsertReturning,
    });
    mockCursorUpsert.mockResolvedValue(undefined);
  });

  it("counts only newly inserted payments", async () => {
    mockFetchPayments.mockResolvedValue({
      records: [
        {
          transaction_hash: "tx1",
          from: "GSENDER",
          amount: "100",
          created_at: "2026-01-01T00:00:00Z",
          transaction_successful: true,
          memo: "INV",
        },
        {
          transaction_hash: "tx2",
          from: "GSENDER",
          amount: "50",
          created_at: "2026-01-02T00:00:00Z",
          transaction_successful: true,
        },
      ],
      nextCursor: "cursor-abc",
    });

    mockInsertReturning
      .mockResolvedValueOnce([{ id: "new-1" }])
      .mockResolvedValueOnce([]);

    const { indexAllWallets } = await import("./indexer");
    const result = await indexAllWallets();

    expect(result.indexed).toBe(1);
    expect(result.wallets[0].newCount).toBe(1);
    expect(result.wallets[0].walletId).toBe("wallet-1");
    expect(mockFetchPayments).toHaveBeenCalledWith("GRECEIVER", null);
  });
});
