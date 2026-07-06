import { describe, expect, it, beforeEach } from "vitest";
import {
  getActiveProvider,
  getActiveProviderId,
  runHealthChecks,
  setActiveProvider,
  MockAnchorProvider,
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
});
