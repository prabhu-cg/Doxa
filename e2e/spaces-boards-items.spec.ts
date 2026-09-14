import { test, expect, type Page } from "@playwright/test";
import {
  createConfirmedTestUser,
  createTestBoard,
  createTestItem,
  createTestItemType,
  createTestOrganizationForUser,
  createTestSpace,
  createTestStatus,
  deleteTestOrganization,
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

test.describe("admin: creating a space, board and item end to end", () => {
  let user: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let org: Awaited<ReturnType<typeof createTestOrganizationForUser>>;

  test.beforeAll(async () => {
    user = await createConfirmedTestUser();
    org = await createTestOrganizationForUser(user.id, "Golden Path Org");
    // createTestOrganizationForUser bypasses the app (raw SQL), so it
    // doesn't get the default item types/statuses that createOrganization
    // seeds for real — add the one of each this test needs directly. The
    // seeding behavior itself is covered separately, end-to-end, below.
    await createTestItemType(org.id, "Feature");
    await createTestStatus(org.id, "Open", true);
  });

  test.afterAll(async () => {
    // Order matters: the item created below is authored by `user`, and
    // Item.authorId has no cascade back to Profile — delete the
    // organization (which cascades its Items) before the user.
    await deleteTestOrganizationById(org.id);
    await deleteTestUser(user.id);
  });

  test("owner creates a space, a public board inside it, and an item on that board", async ({
    page,
  }) => {
    await login(page, user.email, user.password);

    // Create a space.
    await page.goto(`/org/${org.slug}/spaces/new`);
    await page.getByLabel("Name").fill("Product");
    await page.getByRole("button", { name: "Create space" }).click();
    await expect(page).toHaveURL(/\/spaces\/product/);

    // Create a public board inside it. The "New board" link on the space
    // page carries ?space=product, so the space select is pre-filled —
    // only visibility needs choosing.
    await page.getByRole("link", { name: "New board" }).click();
    await page.getByLabel("Name").fill("Feature Requests");
    await page.getByRole("combobox", { name: "Visibility" }).click();
    await page.getByRole("option", { name: /Public/ }).click();
    await page.getByRole("button", { name: "Create board" }).click();
    await expect(page).toHaveURL(/\/boards\/feature-requests/);
    await expect(page.getByText("PUBLIC")).toBeVisible();

    // Submit an item on it.
    await page.getByRole("link", { name: "New item" }).click();
    await page.getByLabel("Title").fill("Add dark mode");
    await page.getByLabel("Description").fill("Please add a dark theme.");
    await page.getByRole("button", { name: "Submit item" }).click();
    await expect(page).toHaveURL(/\/items\/add-dark-mode/);
    await expect(
      page.getByRole("heading", { name: "Add dark mode" }),
    ).toBeVisible();
    // The default status ("Open", seeded on org creation) is applied
    // automatically — the create form never asks the submitter to choose
    // it. ".first()" because the status name also appears as the current
    // value inside the edit form's status combobox further down the page.
    await expect(page.getByText("Open").first()).toBeVisible();

    // The item is browsable on the public board, unauthenticated.
    await page.context().clearCookies();
    await page.goto(`/b/${org.slug}/feature-requests`);
    await expect(
      page.getByRole("heading", { name: "Feature Requests" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Add dark mode" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Add dark mode" }).click();
    await expect(page).toHaveURL(/\/b\/.*\/add-dark-mode/);
    await expect(
      page.getByRole("heading", { name: "Add dark mode" }),
    ).toBeVisible();
    await expect(page.getByText("Please add a dark theme.")).toBeVisible();
  });
});

test.describe("public board and private board protection", () => {
  let owner: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let outsider: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let org: Awaited<ReturnType<typeof createTestOrganizationForUser>>;
  let space: Awaited<ReturnType<typeof createTestSpace>>;
  let itemType: Awaited<ReturnType<typeof createTestItemType>>;
  let status: Awaited<ReturnType<typeof createTestStatus>>;
  let publicBoard: Awaited<ReturnType<typeof createTestBoard>>;
  let privateBoard: Awaited<ReturnType<typeof createTestBoard>>;
  let archivedBoard: Awaited<ReturnType<typeof createTestBoard>>;

  test.beforeAll(async () => {
    owner = await createConfirmedTestUser();
    outsider = await createConfirmedTestUser();
    org = await createTestOrganizationForUser(owner.id, "Visibility Org");
    space = await createTestSpace(org.id, "Product");
    itemType = await createTestItemType(org.id, "Feature");
    status = await createTestStatus(org.id, "Open", true);
    publicBoard = await createTestBoard(org.id, space.id, "Public Roadmap", {
      visibility: "PUBLIC",
    });
    privateBoard = await createTestBoard(org.id, space.id, "Internal Only", {
      visibility: "PRIVATE",
    });
    archivedBoard = await createTestBoard(org.id, space.id, "Old Board", {
      visibility: "PUBLIC",
      status: "ARCHIVED",
    });

    await createTestItem({
      organizationId: org.id,
      spaceId: space.id,
      boardId: privateBoard.id,
      itemTypeId: itemType.id,
      statusId: status.id,
      authorId: owner.id,
      title: "Secret roadmap item",
    });
  });

  test.afterAll(async () => {
    // Same ordering note as above: the fixture item is authored by
    // `owner` — delete the organization first.
    await deleteTestOrganizationById(org.id);
    await deleteTestUser(owner.id);
    await deleteTestUser(outsider.id);
  });

  test("an unauthenticated visitor can view a public board without logging in", async ({
    page,
  }) => {
    await page.goto(`/b/${org.slug}/${publicBoard.slug}`);
    await expect(
      page.getByRole("heading", { name: "Public Roadmap" }),
    ).toBeVisible();
  });

  test("an unauthenticated visitor gets a 404 for a private board, never its content", async ({
    page,
  }) => {
    await page.goto(`/b/${org.slug}/${privateBoard.slug}`);
    await expect(page.getByText("This page could not be found")).toBeVisible();
    await expect(page.getByText("Secret roadmap item")).not.toBeVisible();
  });

  test("a logged-in user who isn't a member also gets a 404 for the private board", async ({
    page,
  }) => {
    await login(page, outsider.email, outsider.password);
    await page.goto(`/b/${org.slug}/${privateBoard.slug}`);
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });

  test("an archived board 404s on the public route even though it's PUBLIC", async ({
    page,
  }) => {
    await page.goto(`/b/${org.slug}/${archivedBoard.slug}`);
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });

  test("a non-member hitting the admin board route directly gets a 404, not a redirect to org data", async ({
    page,
  }) => {
    await login(page, outsider.email, outsider.password);
    await page.goto(`/org/${org.slug}/boards/${publicBoard.slug}`);
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });

  test("a board slug from a different organisation 404s (malicious/guessed IDs)", async ({
    page,
  }) => {
    await page.goto(`/b/no-such-org-${org.id}/${publicBoard.slug}`);
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });
});

test.describe("default item types and statuses are seeded on organisation creation", () => {
  let user: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let orgSlug: string;

  test.beforeAll(async () => {
    user = await createConfirmedTestUser();
  });

  test.afterAll(async () => {
    await deleteTestOrganization(orgSlug);
    await deleteTestUser(user.id);
  });

  test("a brand-new organisation gets the full default item type and status lists, not a fixed 'Feature Request'", async ({
    page,
  }) => {
    await login(page, user.email, user.password);
    await expect(page).toHaveURL(/\/onboarding/);

    await page.getByLabel("Your name").fill("Seed Test User");
    await page.getByLabel("Organisation name").fill("Seed Test Org");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/org\/seed-test-org/);
    orgSlug = new URL(page.url()).pathname.split("/")[2];

    await page.goto(`/org/${orgSlug}/settings/item-types`);
    for (const name of [
      "Feature",
      "Idea",
      "Bug",
      "Improvement",
      "Suggestion",
      "Requirement",
    ]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }

    await page.goto(`/org/${orgSlug}/settings/statuses`);
    for (const name of [
      "Open",
      "Under Review",
      "Planned",
      "In Progress",
      "Completed",
      "Declined",
    ]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    // "Open" starts as the default status a new Item is assigned.
    await expect(
      page
        .getByText("Open", { exact: true })
        .locator("..")
        .getByText("Default"),
    ).toBeVisible();
  });
});
