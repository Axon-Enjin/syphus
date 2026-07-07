import { test, expect } from "@playwright/test";

test.describe("PRD-F1: Auth & Wallet Setup", () => {
  test("unauthenticated user is redirected to /login from /dashboard (QAD-F1-04)", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("heading", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("unauthenticated user is redirected to /login from /dashboard/onboard", async ({
    page,
  }) => {
    await page.goto("/dashboard/onboard");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("heading", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("register page shows validation errors (QAD-F1-03)", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Password").fill("short");

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

    await expect(page.getByText("Invalid email address")).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("register page renders correctly (QAD-F1-01)", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible({
      timeout: 5000,
    });
  });

  test("home page shows getting started preview", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("How it works")).toBeVisible();
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
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
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
    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Email").fill("newuser@example.com");
    await page.getByLabel("Password").fill("longpassword");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(
      page.getByRole("button", { name: /Creating account/i }),
    ).toBeVisible({ timeout: 2000 });
  });
});
