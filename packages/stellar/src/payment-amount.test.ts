import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { normalizeUsdcAmount } from "./index";

describe("normalizeUsdcAmount", () => {
  it("keeps simple integers", () => {
    expect(normalizeUsdcAmount("10")).toBe("10");
  });

  it("trims trailing zeros", () => {
    expect(normalizeUsdcAmount("10.5000000")).toBe("10.5");
  });

  it("rejects non-positive amounts", () => {
    expect(() => normalizeUsdcAmount("0")).toThrow(/Invalid amount/);
    expect(() => normalizeUsdcAmount("-1")).toThrow(/Invalid amount/);
  });
});
