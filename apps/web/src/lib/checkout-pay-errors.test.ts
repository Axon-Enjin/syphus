import { describe, expect, it } from "vitest";
import { explainCheckoutPayError } from "./checkout-pay-errors";

describe("explainCheckoutPayError", () => {
  it("explains op_underfunded on testnet with fund actions", () => {
    const info = explainCheckoutPayError("Payment failed: op_underfunded", {
      network: "testnet",
      amount: "10",
    });
    expect(info.title).toMatch(/not enough usdc/i);
    expect(info.body).toContain("10 USDC");
    expect(info.actions?.some((a) => a.href.includes("friendbot"))).toBe(true);
  });

  it("explains freighter missing", () => {
    const info = explainCheckoutPayError("Freighter not detected", {
      network: "testnet",
    });
    expect(info.title).toMatch(/isn’t available/i);
  });

  it("explains cancelled signing calmly", () => {
    const info = explainCheckoutPayError("Payment signing cancelled", {
      network: "public",
    });
    expect(info.title).toMatch(/wasn’t approved/i);
  });
});
