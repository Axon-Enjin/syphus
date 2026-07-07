import { test, expect } from "@playwright/test";

test.describe("PRD-F5: Agency batch payout", () => {
  test("batch page redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/dashboard/batch");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("heading", { name: "Sign in" }),
    ).toBeVisible();
  });
});
