import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/indexer", () => ({
  getTransactionsInRange: vi.fn().mockResolvedValue([
    {
      id: "tx-1",
      userId: "user-1",
      walletId: "w-1",
      transactionHash: "hash1",
      senderAddress: "GABC",
      amountUsdc: "100",
      memo: null,
      stellarCreatedAt: new Date("2026-01-01"),
      indexedAt: new Date(),
    },
  ]),
}));

vi.mock("@syphus/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@syphus/db")>();
  return {
    ...actual,
    getDb: () => ({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ name: "Test", email: "t@e.com" }]),
          }),
        }),
      }),
    }),
    users: { id: "id", name: "name", email: "email" },
  };
});

import { auth } from "@/lib/auth";
import { getTransactionsInRange } from "@/lib/indexer";
import { GET } from "./route";

describe("GET /api/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated (QAD-F4-04)", async () => {
    vi.mocked(auth).mockResolvedValue(undefined as never);

    const res = await GET(
      new Request("http://localhost/api/export?format=csv&months=6"),
    );

    expect(res.status).toBe(401);
  });

  it("returns CSV scoped to authenticated user (QAD-F4-01)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", email: "t@e.com" },
    } as never);

    const res = await GET(
      new Request("http://localhost/api/export?format=csv&months=6"),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(getTransactionsInRange).toHaveBeenCalledWith(
      "user-1",
      expect.any(Date),
      expect.any(Date),
    );
  });

  it("returns PDF when format=pdf (QAD-F4-02)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", email: "t@e.com" },
    } as never);

    const res = await GET(
      new Request("http://localhost/api/export?format=pdf&months=6"),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain("income-report.pdf");

    const buf = await res.arrayBuffer();
    const header = new TextDecoder().decode(buf.slice(0, 5));
    expect(header).toBe("%PDF-");
  });

  it("does not export another user's data (QAD-F4-04)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-a", email: "a@e.com" },
    } as never);

    await GET(
      new Request("http://localhost/api/export?format=csv&months=6"),
    );

    expect(getTransactionsInRange).toHaveBeenCalledWith(
      "user-a",
      expect.any(Date),
      expect.any(Date),
    );
    expect(getTransactionsInRange).not.toHaveBeenCalledWith(
      "user-b",
      expect.any(Date),
      expect.any(Date),
    );
  });
});
