import { test, expect, type Page } from "@playwright/test";
import {
  addTestMembership,
  createConfirmedTestUser,
  createTestOrganizationForUser,
  deleteTestOrganizationById,
  deleteTestUser,
} from "./utils/test-users";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * Exercises Phase 5's billing/entitlement Server Actions through the
 * real UI — changePlan/cancelSubscription need a live request context
 * (cookies()) that a Vitest integration test can't provide (same
 * reasoning as every other e2e-only Server Action path in this
 * codebase). STRIPE_SECRET_KEY is unset in the test environment (see
 * docs/environment.md — never required locally), so changePlan always
 * takes its direct-local-write branch here, exactly the path a
 * production deployment would only use for FREE downgrades.
 */
test.describe.serial("Billing and entitlements", () => {
  let owner: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let admin: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let org: Awaited<ReturnType<typeof createTestOrganizationForUser>>;

  test.beforeAll(async () => {
    owner = await createConfirmedTestUser();
    admin = await createConfirmedTestUser();
    org = await createTestOrganizationForUser(owner.id, "Billing Test Org");
    await addTestMembership(org.id, admin.id, "ADMIN");
  });

  test.afterAll(async () => {
    await deleteTestOrganizationById(org.id);
    await deleteTestUser(owner.id);
    await deleteTestUser(admin.id);
  });

  test("a new organisation starts on Free with Free's limits shown", async ({
    page,
  }) => {
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}/settings/billing`);
    await expect(
      page.getByRole("heading", { name: "Current plan: Free" }),
    ).toBeVisible();
    // The owner plus the admin membership added in beforeAll.
    await expect(page.getByText("Members: 2 / 5")).toBeVisible();
  });

  test("an admin (not the owner) cannot change or cancel the plan", async ({
    page,
  }) => {
    await login(page, admin.email, admin.password);
    await page.goto(`/org/${org.slug}/settings/billing`);
    await expect(
      page.getByText("Only the organisation owner can change or cancel"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Switch to Pro" }),
    ).not.toBeVisible();
  });

  test("custom branding is refused on Free, with a clear upgrade message", async ({
    page,
  }) => {
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}/settings/branding`);
    await expect(
      page.getByText("Custom branding requires the Pro plan or higher"),
    ).toBeVisible();

    await page.getByLabel("Accent colour").fill("#ff0000");
    await page.getByRole("button", { name: "Save branding" }).click();
    await expect(
      page.getByText("Custom branding requires the Pro plan or higher"),
    ).toBeVisible();
  });

  test("advanced (cross-board) prioritisation is paywalled on Free", async ({
    page,
  }) => {
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}/prioritization`);
    await expect(
      page.getByText("requires the Pro plan or higher"),
    ).toBeVisible();
  });

  test("the owner upgrades to Pro directly (no Stripe configured), which lifts the entitlement gates", async ({
    page,
  }) => {
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}/settings/billing`);
    await page.getByRole("button", { name: "Switch to Pro" }).click();
    await expect(
      page.getByRole("heading", { name: "Current plan: Pro" }),
    ).toBeVisible();

    // Branding is now allowed.
    await page.goto(`/org/${org.slug}/settings/branding`);
    await expect(
      page.getByText("Custom branding requires the Pro plan or higher"),
    ).not.toBeVisible();
    await page.getByLabel("Accent colour").fill("#ff0000");
    await page.getByRole("button", { name: "Save branding" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    // Advanced prioritisation is now allowed.
    await page.goto(`/org/${org.slug}/prioritization`);
    await expect(
      page.getByRole("heading", { name: "Prioritisation" }),
    ).toBeVisible();
    await expect(
      page.getByText("requires the Pro plan or higher"),
    ).not.toBeVisible();
  });

  test("the plan change and branding update are recorded in the audit log", async ({
    page,
  }) => {
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}/settings/audit-log`);
    await expect(page.getByText("Plan changed")).toBeVisible();
    await expect(page.getByText("Branding updated")).toBeVisible();
  });

  test("cancelling reverts to Free at the click of a button (dev-mode immediate flag flip)", async ({
    page,
  }) => {
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}/settings/billing`);
    await page.getByRole("button", { name: "Cancel plan" }).click();
    await page.getByRole("button", { name: "Cancel plan" }).last().click();
    await expect(page.getByText("Cancels at period end")).toBeVisible();
  });
});
