import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getUsdcIssuer,
  TESTNET_USDC_ISSUER,
  PUBLIC_USDC_ISSUER,
} from "./index";

describe("getUsdcIssuer", () => {
  const originalIssuer = process.env.USDC_ISSUER;
  const originalNetwork = process.env.STELLAR_NETWORK;

  afterEach(() => {
    process.env.USDC_ISSUER = originalIssuer;
    process.env.STELLAR_NETWORK = originalNetwork;
  });

  beforeEach(() => {
    delete process.env.USDC_ISSUER;
    process.env.STELLAR_NETWORK = "testnet";
  });

  it("defaults to testnet Circle USDC issuer when unset", () => {
    expect(getUsdcIssuer()).toBe(TESTNET_USDC_ISSUER);
  });

  it("defaults to mainnet issuer on public network", () => {
    process.env.STELLAR_NETWORK = "public";
    expect(getUsdcIssuer()).toBe(PUBLIC_USDC_ISSUER);
  });

  it("uses configured issuer when valid", () => {
    process.env.USDC_ISSUER = TESTNET_USDC_ISSUER;
    expect(getUsdcIssuer()).toBe(TESTNET_USDC_ISSUER);
  });

  it("strips quotes from env value", () => {
    process.env.USDC_ISSUER = `"${TESTNET_USDC_ISSUER}"`;
    expect(getUsdcIssuer()).toBe(TESTNET_USDC_ISSUER);
  });

  it("throws a clear error for invalid issuer", () => {
    process.env.USDC_ISSUER = "not-a-valid-issuer";
    expect(() => getUsdcIssuer()).toThrow(/USDC_ISSUER is not a valid Stellar address/);
  });
});
