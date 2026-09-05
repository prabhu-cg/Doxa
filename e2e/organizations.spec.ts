import { test, expect, type Page } from "@playwright/test";
import {
  createConfirmedTestUser,
  createTestOrganizationForUser,
  deleteTestOrganization,
  deleteTestUser,
} from "./utils/test-users";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

test.describe("onboarding and organisation creation", () => {
  let user: Awaited<ReturnType<typeof createConfirmedTestUser>>;

  test.beforeAll(async () => {
    user = await createConfirmedTestUser();
  });

  test.afterAll(async () => {
    await deleteTestUser(user.id);
    await deleteTestOrganization("compiler-co");
  });

  test("a brand new user completes onboarding into a fresh organisation as its owner", async ({
    page,
  }) => {
    await login(page, user.email, user.password);
    await expect(page).toHaveURL(/\/onboarding/);

    await page.getByLabel("Your name").fill("Grace Hopper");
    await page.getByLabel("Organisation name").fill("Compiler Co");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/org\/compiler-co/);
    await expect(
      page.getByRole("heading", { name: "Compiler Co" }),
    ).toBeVisible();
    await expect(page.getByText("OWNER")).toBeVisible();
  });
});

test.describe("organisation switching and settings", () => {
  let user: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let orgA: Awaited<ReturnType<typeof createTestOrganizationForUser>>;
  let orgB: Awaited<ReturnType<typeof createTestOrganizationForUser>>;

  test.beforeAll(async () => {
    user = await createConfirmedTestUser();
    orgA = await createTestOrganizationForUser(user.id, "Switch Org A");
    orgB = await createTestOrganizationForUser(user.id, "Switch Org B");
  });

  test.afterAll(async () => {
    await deleteTestUser(user.id);
    await deleteTestOrganization(orgA.slug);
    await deleteTestOrganization(orgB.slug);
  });

  test("switches between organisations via the switcher", async ({ page }) => {
    await login(page, user.email, user.password);
    await expect(page).toHaveURL(
      new RegExp(`/org/(${orgA.slug}|${orgB.slug})`),
    );

    await page
      .getByRole("button", { name: orgA.name })
      .or(page.getByRole("button", { name: orgB.name }))
      .first()
      .click();
    await page.getByRole("menuitem", { name: orgB.name }).click();
    await expect(page).toHaveURL(new RegExp(`/org/${orgB.slug}$`));
    await expect(page.getByRole("heading", { name: orgB.name })).toBeVisible();
  });

  test("renaming an organisation updates the dashboard and switcher", async ({
    page,
  }) => {
    await login(page, user.email, user.password);
    await page.goto(`/org/${orgA.slug}/settings`);
    await page.getByLabel("Organisation name").fill("Switch Org A Renamed");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Saved.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Switch Org A Renamed" }),
    ).toBeVisible();
  });

  test("the sole owner cannot leave the organisation", async ({ page }) => {
    await login(page, user.email, user.password);
    await page.goto(`/org/${orgB.slug}/settings`);
    await expect(
      page.getByRole("button", { name: "Leave organisation" }),
    ).toBeDisabled();
  });
});

test.describe("cross-tenant access prevention", () => {
  let userA: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let userB: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let orgA: Awaited<ReturnType<typeof createTestOrganizationForUser>>;

  test.beforeAll(async () => {
    userA = await createConfirmedTestUser();
    userB = await createConfirmedTestUser();
    orgA = await createTestOrganizationForUser(userA.id, "Private Org A");
  });

  test.afterAll(async () => {
    await deleteTestUser(userA.id);
    await deleteTestUser(userB.id);
    await deleteTestOrganization(orgA.slug);
  });

  test("a user who isn't a member gets a 404, not org A's data, for a known-valid slug", async ({
    page,
  }) => {
    await login(page, userB.email, userB.password);
    await expect(page).toHaveURL(/\/onboarding/); // userB has no orgs of their own

    await page.goto(`/org/${orgA.slug}`);
    await expect(page.getByText("This page could not be found")).toBeVisible();
    await expect(page.getByText("Private Org A")).not.toBeVisible();

    await page.goto(`/org/${orgA.slug}/settings`);
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });
});
