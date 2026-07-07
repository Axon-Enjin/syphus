import { describe, expect, it, beforeEach } from "vitest";
import {
  getActiveProvider,
  getActiveProviderId,
  getFallbackProviderId,
  getOffRampStatus,
  getProvider,
  runHealthChecks,
  setActiveProvider,
  MockAnchorProvider,
  BCRemitAnchorProvider,
  CoinsPhAnchorProvider,
} from "./orchestrator";

describe("anchor orchestrator", () => {
  beforeEach(() => {
    setActiveProvider("mock");
  });

  it("defaults to mock provider", () => {
    expect(getActiveProviderId()).toBe("mock");
    expect(getActiveProvider().id).toBe("mock");
  });

  it("starts mock withdrawal session", async () => {
    const session = await getActiveProvider().startWithdrawal({
      amountUsdc: "100",
      destinationAccount: "GCKFBEIYTKPGAFASQ2HDYVDGJLEQCKZJLK3K7K6JGHPU4V6HCB5CXQW",
      callbackUrl: "http://localhost/callback",
    });
    expect(session.id).toMatch(/^mock-/);
    expect(session.url).toContain("mock.anchor.test");
  });

  it("runs health checks", async () => {
    const results = await runHealthChecks();
    expect(results.mock).toBe("healthy");
  });

  it("exposes bcremit provider", () => {
    const provider = getProvider("bcremit");
    expect(provider).toBeInstanceOf(BCRemitAnchorProvider);
    expect(provider.id).toBe("bcremit");
  });

  it("exposes coinsph provider", () => {
    const provider = getProvider("coinsph");
    expect(provider).toBeInstanceOf(CoinsPhAnchorProvider);
    expect(provider.id).toBe("coinsph");
  });

  it("can switch active provider to bcremit", () => {
    setActiveProvider("bcremit");
    expect(getActiveProviderId()).toBe("bcremit");
    expect(getActiveProvider().id).toBe("bcremit");
  });

  it("reports off-ramp status", () => {
    const status = getOffRampStatus();
    expect(status).toHaveProperty("paused");
    expect(status).toHaveProperty("activeProvider");
    expect(status).toHaveProperty("primaryProvider");
    expect(status.fallbackProvider).toBe(getFallbackProviderId());
  });
});

describe("BCRemitAnchorProvider", () => {
  it("returns down health when transfer server is not configured", async () => {
    const original = process.env.BCREMIT_TRANSFER_SERVER;
    delete process.env.BCREMIT_TRANSFER_SERVER;
    const provider = new BCRemitAnchorProvider();
    expect(await provider.healthCheck()).toBe("down");
    if (original) {
      process.env.BCREMIT_TRANSFER_SERVER = original;
    }
  });
});
