import { describe, expect, it, beforeEach } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { buildSep7Uri, isValidPublicKey, TESTNET_USDC_ISSUER } from "./index";

describe("buildSep7Uri", () => {
  beforeEach(() => {
    process.env.USDC_ISSUER = TESTNET_USDC_ISSUER;
    process.env.STELLAR_NETWORK = "testnet";
  });

  it("builds a valid SEP-7 URI", () => {
    const destination = Keypair.random().publicKey();
    const uri = buildSep7Uri({
      destination,
      amount: "500",
      memo: "INV001",
    });
    expect(uri).toContain("web+stellar:pay?");
    expect(uri).toContain(`destination=${destination}`);
    expect(uri).toContain("amount=500");
    expect(uri).toContain("asset_code=USDC");
    expect(uri).toContain("memo=INV001");
  });

  it("rejects invalid addresses", () => {
    expect(() =>
      buildSep7Uri({ destination: "not-a-key", amount: "1" }),
    ).toThrow("Invalid Stellar destination address");
  });
});

describe("isValidPublicKey", () => {
  it("validates G-addresses", () => {
    expect(isValidPublicKey(Keypair.random().publicKey())).toBe(true);
    expect(isValidPublicKey("bad")).toBe(false);
  });
});
