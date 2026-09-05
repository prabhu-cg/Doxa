import { test, expect } from "@playwright/test";
import {
  createConfirmedTestUser,
  createTestOrganizationForUser,
  deleteTestOrganization,
  deleteTestUser,
} from "./utils/test-users";

test.describe("registration", () => {
  // This test calls the real Supabase signUp() endpoint (the only way to
  // observe the "no session yet" response our UI reacts to), which counts
  // against the project's real "emails per hour" Auth rate limit — a low
  // default outside a custom SMTP setup. Expect this specific test to
  // fail with "email rate limit exceeded" if the suite has run signups
  // repeatedly within the same hour; that's Supabase's quota, not an app
  // bug. See Authentication > Rate Limits in the Supabase dashboard.
  test("shows a check-your-email message instead of logging in directly", async ({
    page,
  }) => {
    const email = `doxa-e2e-register-${Date.now()}@doxa-e2e-mail.com`;
    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page
      .getByLabel("Password", { exact: true })
      .fill("Test-password-123!");
    await page.getByLabel("Confirm password").fill("Test-password-123!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Check your email")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test("rejects mismatched passwords client-side", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(`doxa-e2e-${Date.now()}@example.com`);
    await page
      .getByLabel("Password", { exact: true })
      .fill("Test-password-123!");
    await page.getByLabel("Confirm password").fill("something-else-123!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });
});

test.describe("login, protected routes, and logout", () => {
  let user: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let org: Awaited<ReturnType<typeof createTestOrganizationForUser>>;

  test.beforeAll(async () => {
    user = await createConfirmedTestUser();
    // Gives this user an org up front, so post-login they land in the
    // full app shell (with the account dropdown) rather than onboarding.
    org = await createTestOrganizationForUser(user.id, "Sign Out Test Org");
  });

  test.afterAll(async () => {
    await deleteTestUser(user.id);
    await deleteTestOrganization(org.slug);
  });

  test("an unauthenticated visit to a protected route redirects to login with a next param, and login returns you there", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login\?next=%2Fprofile/);

    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/profile/);
    await expect(
      page.getByRole("heading", { name: "Profile settings" }),
    ).toBeVisible();
  });

  test("signing out ends the session and protected routes redirect again", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });
});
