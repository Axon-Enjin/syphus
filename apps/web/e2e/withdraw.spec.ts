import { test, expect } from "@playwright/test";

test.describe("PRD-F3: Anchor off-ramp", () => {
  test("unauthenticated withdraw page redirects to login", async ({ page }) => {
    await page.goto("/dashboard/withdraw");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("heading", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("withdraw callback requires auth", async ({ page }) => {
    await page.goto("/dashboard/withdraw/callback?id=mock-123");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("heading", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("health endpoint reports anchor and off-ramp status", async ({
    request,
  }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBeLessThan(500);
    const body = await res.json();
    expect(body.checks.app).toBe("ok");
    expect(body.checks.anchor).toBeTruthy();
    expect(["available", "paused"]).toContain(body.checks.offRamp);
    expect(body.offRamp).toHaveProperty("activeProvider");
  });
});
