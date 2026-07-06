import { test, expect } from "@playwright/test";

test.describe("PRD-F1: Auth & Wallet Setup", () => {
  test("unauthenticated user is redirected to /login from /dashboard (QAD-F1-04)", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
    await expect(page.getByText("Sign in")).toBeVisible();
  });

  test("unauthenticated user is redirected to /login from /dashboard/onboard", async ({
    page,
  }) => {
    await page.goto("/dashboard/onboard");
    await page.waitForURL("**/login");
    await expect(page.getByText("Sign in")).toBeVisible();
  });

  test("register page shows validation errors (QAD-F1-03)", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(page.getByText("Create account")).toBeVisible();

    // Submit with empty fields (HTML validation will prevent, so fill partially)
    await page.getByPlaceholder("Full name").fill("Test User");
    await page.getByPlaceholder("Email").fill("invalid-email");
    await page.getByPlaceholder("Password (min 8 chars)").fill("short");

    // HTML5 validation may block - use JavaScript to bypass
    await page.evaluate(() => {
      document
        .querySelectorAll("input")
        .forEach((input) => input.removeAttribute("required"));
      document
        .querySelectorAll('input[type="email"]')
        .forEach((input) => input.removeAttribute("type"));
      document
        .querySelectorAll("input[minlength]")
        .forEach((input) => input.removeAttribute("minlength"));
    });

    await page.getByRole("button", { name: "Register" }).click();

    // Should show field-level error (email invalid or password too short)
    await expect(
      page.locator("text=Invalid email address").or(
        page.locator("text=Password must be at least 8 characters"),
      ),
    ).toBeVisible({ timeout: 5000 });
  });

  test("register page renders correctly (QAD-F1-01)", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Create account")).toBeVisible();
    await expect(page.getByPlaceholder("Full name")).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(
      page.getByPlaceholder("Password (min 8 chars)"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sign in")).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("nobody@example.com");
    await page.getByPlaceholder("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible({
      timeout: 5000,
    });
  });

  test("home page shows getting started preview", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Getting started takes three steps"),
    ).toBeVisible();
    await expect(page.getByText("Get your payment address")).toBeVisible();
  });

  test("register page explains wallet options", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByText(/create a payment address for you/i),
    ).toBeVisible();
    await expect(
      page.getByText(/connect your existing Freighter wallet/i),
    ).toBeVisible();
  });

  test("login button shows loading state while submitting", async ({
    page,
  }) => {
    await page.route("**/api/auth/**", async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.continue();
    });

    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("nobody@example.com");
    await page.getByPlaceholder("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByRole("button", { name: /Signing in/i }),
    ).toBeVisible({ timeout: 2000 });
  });

  test("register button shows creating account label on submit", async ({
    page,
  }) => {
    await page.route("**/register**", async (route) => {
      if (route.request().method() === "POST") {
        await new Promise((r) => setTimeout(r, 400));
      }
      await route.continue();
    });

    await page.goto("/register");
    await page.getByPlaceholder("Full name").fill("Test User");
    await page.getByPlaceholder("Email").fill("newuser@example.com");
    await page.getByPlaceholder("Password (min 8 chars)").fill("longpassword");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(
      page.getByRole("button", { name: /Creating account/i }),
    ).toBeVisible({ timeout: 2000 });
  });
});
