import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockLimit } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
}));

vi.mock("@syphus/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@syphus/db")>();
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: mockLimit,
  };
  return {
    ...actual,
    getDb: () => mockDb,
    paymentLinks: { slug: "slug", userId: "user_id" },
    wallets: { userId: "user_id", publicKey: "public_key" },
    users: { id: "id", name: "name" },
  };
});

vi.mock("@syphus/stellar", () => ({
  buildSep7Uri: vi.fn(() => "web+stellar:pay?destination=GTEST"),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { getPaymentLinkBySlug } from "./payments";

describe("getPaymentLinkBySlug", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user name from users join", async () => {
    mockLimit.mockResolvedValueOnce([
      {
        slug: "abc123",
        amountUsdc: "500",
        memo: "INV1",
        label: "March invoice",
        publicKey: "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLMNOPQ",
        userName: "Maria Santos",
      },
    ]);

    const result = await getPaymentLinkBySlug("abc123");

    expect(result).not.toBeNull();
    expect(result?.userName).toBe("Maria Santos");
    expect(result?.sep7Uri).toBe("web+stellar:pay?destination=GTEST");
  });

  it("returns null when slug not found", async () => {
    mockLimit.mockResolvedValueOnce([]);

    const result = await getPaymentLinkBySlug("missing");
    expect(result).toBeNull();
  });
});
