import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockLimit } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
}));

vi.mock("@gig-payout/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@gig-payout/db")>();
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: mockLimit,
  };
  return {
    ...actual,
    getDb: () => mockDb,
    wallets: {
      userId: "user_id",
      trustlineReady: "trustline_ready",
    },
  };
});

import { getTrustlineReadyForUser } from "./auth-helpers";

describe("getTrustlineReadyForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when wallet has trustline ready", async () => {
    mockLimit.mockResolvedValueOnce([{ trustlineReady: true }]);

    const result = await getTrustlineReadyForUser("user-123");
    expect(result).toBe(true);
  });

  it("returns false when wallet has no trustline", async () => {
    mockLimit.mockResolvedValueOnce([{ trustlineReady: false }]);

    const result = await getTrustlineReadyForUser("user-123");
    expect(result).toBe(false);
  });

  it("returns false when no wallet exists", async () => {
    mockLimit.mockResolvedValueOnce([]);

    const result = await getTrustlineReadyForUser("user-missing");
    expect(result).toBe(false);
  });
});
