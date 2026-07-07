import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/indexer", () => ({
  getTransactionsInRange: vi.fn().mockResolvedValue([]),
}));

vi.mock("@gig-payout/db", () => ({
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
}));

import { auth } from "@/lib/auth";
import { GET } from "./route";

describe("GET /api/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(undefined as never);

    const res = await GET(
      new Request("http://localhost/api/export?format=csv&months=6"),
    );

    expect(res.status).toBe(401);
  });

  it("returns CSV when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", email: "t@e.com" },
    } as never);

    const res = await GET(
      new Request("http://localhost/api/export?format=csv&months=6"),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
  });
});
