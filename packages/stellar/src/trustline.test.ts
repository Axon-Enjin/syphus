import { describe, expect, it, beforeEach, vi } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { checkUsdcTrustline } from "./trustline";
import { TESTNET_USDC_ISSUER } from "./index";

const USDC_ISSUER = TESTNET_USDC_ISSUER;

describe("checkUsdcTrustline", () => {
  beforeEach(() => {
    process.env.USDC_ISSUER = USDC_ISSUER;
    process.env.STELLAR_NETWORK = "testnet";
    process.env.HORIZON_URL = "https://horizon-testnet.stellar.org";
    vi.restoreAllMocks();
  });

  it("returns exists: true when account has USDC trustline", async () => {
    const publicKey = Keypair.random().publicKey();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        balances: [
          {
            asset_type: "credit_alphanum4",
            asset_code: "USDC",
            asset_issuer: USDC_ISSUER,
            balance: "150.0000000",
          },
          {
            asset_type: "native",
            balance: "10.0000000",
          },
        ],
      }),
    } as Response);

    const result = await checkUsdcTrustline(publicKey);
    expect(result.exists).toBe(true);
    expect(result.balance).toBe("150.0000000");
  });

  it("returns exists: false when account has no USDC trustline", async () => {
    const publicKey = Keypair.random().publicKey();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        balances: [
          {
            asset_type: "native",
            balance: "10.0000000",
          },
        ],
      }),
    } as Response);

    const result = await checkUsdcTrustline(publicKey);
    expect(result.exists).toBe(false);
    expect(result.balance).toBeNull();
  });

  it("returns exists: false when account not found (404)", async () => {
    const publicKey = Keypair.random().publicKey();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response);

    const result = await checkUsdcTrustline(publicKey);
    expect(result.exists).toBe(false);
    expect(result.balance).toBeNull();
  });

  it("throws on Horizon error (non-404)", async () => {
    const publicKey = Keypair.random().publicKey();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(checkUsdcTrustline(publicKey)).rejects.toThrow(
      "Horizon error: 500",
    );
  });

  it("throws on invalid public key", async () => {
    await expect(checkUsdcTrustline("bad-key")).rejects.toThrow(
      "Invalid Stellar public key",
    );
  });

  it("ignores USDC from wrong issuer", async () => {
    const publicKey = Keypair.random().publicKey();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        balances: [
          {
            asset_type: "credit_alphanum4",
            asset_code: "USDC",
            asset_issuer: "GNOTTHEISSUER000000000000000000000000000000000000000000",
            balance: "100.0000000",
          },
          {
            asset_type: "native",
            balance: "10.0000000",
          },
        ],
      }),
    } as Response);

    const result = await checkUsdcTrustline(publicKey);
    expect(result.exists).toBe(false);
    expect(result.balance).toBeNull();
  });
});
