import { describe, expect, it } from "vitest";
import { buildWithdrawCallbackUrl } from "./callback-url";

describe("buildWithdrawCallbackUrl (QAD-SEC-02)", () => {
  it("builds callback from configured AUTH_URL origin", () => {
    expect(buildWithdrawCallbackUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/dashboard/withdraw/callback",
    );
  });

  it("rejects non-http(s) protocols", () => {
    expect(() => buildWithdrawCallbackUrl("file:///etc/passwd")).toThrow(
      /http or https/i,
    );
  });

  it("blocks cloud metadata SSRF hosts", () => {
    expect(() =>
      buildWithdrawCallbackUrl("http://metadata.google.internal"),
    ).toThrow(/not allowed/i);
  });

  it("strips user-supplied path from AUTH_URL", () => {
    expect(buildWithdrawCallbackUrl("https://app.example.com/admin")).toBe(
      "https://app.example.com/dashboard/withdraw/callback",
    );
  });
});
