import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies before importing the module under test
vi.mock("@gig-payout/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@gig-payout/db")>();
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "user-123" }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  };
  return {
    ...actual,
    getDb: () => mockDb,
    users: { id: "id", email: "email" },
    wallets: {
      id: "id",
      userId: "user_id",
      publicKey: "public_key",
      trustlineReady: "trustline_ready",
    },
    withDbRetry: async <T>(fn: () => Promise<T>) => fn(),
    __mockDb: mockDb,
  };
});

vi.mock("@gig-payout/stellar", () => ({
  generateKeypair: () => ({
    publicKey: "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLMNOPQ",
    secretKey: "SABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLMNOPQ",
  }),
  checkUsdcTrustline: vi.fn(),
  fundTestnetAccount: vi.fn().mockResolvedValue({ ok: true }),
  isTestnet: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/crypto", () => ({
  encryptSecret: (s: string) => `encrypted:${s}`,
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: { hash: async (_p: string, _r: number) => "hashed-password" },
}));

import { registerUser } from "./auth";

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns field errors for invalid email", async () => {
    const form = new FormData();
    form.set("email", "not-an-email");
    form.set("password", "longpassword");
    form.set("name", "Test User");

    const result = await registerUser(form);
    expect(result.fieldErrors?.email).toBeDefined();
    expect(result.ok).toBeUndefined();
  });

  it("returns field errors for short password", async () => {
    const form = new FormData();
    form.set("email", "test@example.com");
    form.set("password", "short");
    form.set("name", "Test User");

    const result = await registerUser(form);
    expect(result.fieldErrors?.password).toBeDefined();
    expect(result.ok).toBeUndefined();
  });

  it("returns field errors for missing name", async () => {
    const form = new FormData();
    form.set("email", "test@example.com");
    form.set("password", "longpassword");
    form.set("name", "");

    const result = await registerUser(form);
    expect(result.fieldErrors?.name).toBeDefined();
    expect(result.ok).toBeUndefined();
  });

  it("returns field error when email already registered", async () => {
    const { __mockDb } = await import("@gig-payout/db") as unknown as {
      __mockDb: { limit: ReturnType<typeof vi.fn> };
    };
    __mockDb.limit.mockResolvedValueOnce([{ id: "existing-user" }]);

    const form = new FormData();
    form.set("email", "taken@example.com");
    form.set("password", "longpassword");
    form.set("name", "Test User");

    const result = await registerUser(form);
    expect(result.fieldErrors?.email).toBe("Email already registered");
  });

  it("returns ok: true on successful registration", async () => {
    const { __mockDb } = await import("@gig-payout/db") as unknown as {
      __mockDb: {
        limit: ReturnType<typeof vi.fn>;
        returning: ReturnType<typeof vi.fn>;
        values: ReturnType<typeof vi.fn>;
      };
    };
    // First call (duplicate check) returns empty
    __mockDb.limit.mockResolvedValueOnce([]);
    // Insert user returns id
    __mockDb.returning.mockResolvedValueOnce([{ id: "new-user-123" }]);
    // Insert wallet (values call returns the chain)
    __mockDb.values.mockReturnThis();

    const form = new FormData();
    form.set("email", "new@example.com");
    form.set("password", "securepass");
    form.set("name", "New User");

    const result = await registerUser(form);
    expect(result.ok).toBe(true);
    expect(result.fieldErrors).toBeUndefined();
    expect(result.error).toBeUndefined();
  });
});
