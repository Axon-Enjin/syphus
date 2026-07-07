import { test, expect } from "@playwright/test";

test.describe("PRD-F2: SEP-7 payment link", () => {
  test("unauthenticated pay page redirects to login", async ({ page }) => {
    await page.goto("/dashboard/pay");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("heading", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("payment slug API rate limits brute force (QAD-F2-04)", async ({
    request,
  }) => {
    const slug = "nonexistent-slug-test";
    let saw429 = false;

    for (let i = 0; i < 35; i++) {
      const res = await request.get(`/api/p/${slug}`);
      if (res.status() === 429) {
        saw429 = true;
        break;
      }
    }

    expect(saw429).toBe(true);
  });
});
