import { test, expect } from "@playwright/test";

test.describe("Public landing", () => {
  test("home page renders hero and value props", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /USDC payroll for your PH team/i,
      }),
    ).toBeVisible();
    await expect(page.getByText("Receive USDC")).toBeVisible();
    await expect(page.getByText("Withdraw to bank")).toBeVisible();
    await expect(page.getByText("Export income")).toBeVisible();
    await expect(page.getByRole("link", { name: "Get started" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
  });

  test("home page shows how it works", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("How it works")).toBeVisible();
    await expect(page.getByText("Enable USDC")).toBeVisible();
  });

  test("checkout page returns 404 for invalid slug", async ({ page }) => {
    const res = await page.goto("/p/invalidslugnotfound");
    expect(res?.status()).toBe(404);
  });
});
