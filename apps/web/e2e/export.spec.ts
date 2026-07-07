import { test, expect } from "@playwright/test";

test.describe("PRD-F4: Income export", () => {
  test("unauthenticated export page redirects to login (QAD-F4-04)", async ({
    page,
  }) => {
    await page.goto("/dashboard/export");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("heading", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("export API returns 401 when unauthenticated (QAD-F4-04)", async ({
    request,
  }) => {
    const res = await request.get("/api/export?format=csv&months=6");
    expect(res.status()).toBe(401);
  });

  test("export API rejects unauthenticated PDF download (QAD-F4-02)", async ({
    request,
  }) => {
    const res = await request.get("/api/export?format=pdf&months=6");
    expect(res.status()).toBe(401);
  });
});
