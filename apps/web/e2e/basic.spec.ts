import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "USDC payroll",
  );
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Sign in")).toBeVisible();
});

test("health endpoint", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.checks.app).toBe("ok");
});
