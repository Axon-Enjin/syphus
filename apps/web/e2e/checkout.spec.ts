import { test, expect } from "@playwright/test";

test.describe("Public landing", () => {
  test("home page renders hero and value props", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Withdraw to PHP the same day/i,
      }),
    ).toBeVisible();
    await expect(page.locator(".landing-simulator__php")).toContainText("₱29,350");
    await expect(page.getByText("Instant USDC settlement")).toBeVisible();
    await expect(page.getByText("Direct PH withdrawals")).toBeVisible();
    await expect(page.getByText("Smart tax and export")).toBeVisible();
    await expect(page.getByRole("link", { name: "Get started" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
  });

  test("home page shows how it works", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("How it works")).toBeVisible();
    await expect(page.getByText("Create account")).toBeVisible();
    await expect(page.getByText("Share a link")).toBeVisible();
    await expect(page.getByText("Withdraw to bank").first()).toBeVisible();
    await expect(page.getByText("Stellar address")).toBeVisible();
    await expect(page.getByText("PHP payout")).toBeVisible();
  });

  test("home page shows calculator and faq", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Client pays")).toBeVisible();
    await expect(page.getByText("Common questions")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Do my clients need a crypto wallet?" }),
    ).toBeVisible();
  });

  test("checkout page returns 404 for invalid slug", async ({ page }) => {
    const res = await page.goto("/p/invalidslugnotfound");
    expect(res?.status()).toBe(404);
  });
});
