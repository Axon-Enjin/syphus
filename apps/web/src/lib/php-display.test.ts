import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatPhpApprox, sumPhpApprox, getPhpReferenceRate } from "./php-display";

describe("formatPhpApprox", () => {
  beforeEach(() => {
    vi.stubEnv("PHP_REFERENCE_RATE", "53");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("converts 500 USDC at rate 53 to approx PHP", () => {
    const result = formatPhpApprox("500");
    expect(result.php).toBe("₱26,500");
    expect(result.label).toBe("approx.");
  });

  it("sums multiple USDC amounts", () => {
    const result = sumPhpApprox(["500", "250"]);
    expect(result.php).toBe("₱39,750");
    expect(result.label).toBe("approx.");
  });

  it("falls back to default rate when env is invalid", () => {
    vi.stubEnv("PHP_REFERENCE_RATE", "invalid");
    expect(getPhpReferenceRate()).toBe(53);
  });
});
