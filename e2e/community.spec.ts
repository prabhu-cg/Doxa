import { test, expect, type Page } from "@playwright/test";
import {
  addTestMembership,
  createConfirmedTestUser,
  createTestBoard,
  createTestItemType,
  createTestOrganizationForUser,
  createTestPriority,
  createTestSpace,
  createTestStatus,
  deleteTestOrganizationById,
  deleteTestUser,
  setTestUsername,
} from "./utils/test-users";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * Exercises the Phase 3 community loop (submit → vote → comment → follow
 * → activity → notification) end to end, plus moderation and tenant
 * isolation. The DB-level uniqueness/race and permission-matrix behavior
 * behind these actions is covered by the features/*.integration.test.ts
 * suites — this file is about the actual Server Action + UI wiring, which
 * (like Phase 2's e2e suite) needs a real request context.
 */
// .serial(): the three tests below share one item's votes/comments and
// build on each other's state (like one continuous user journey split up
// for readability) — fullyParallel is the project default, so this
// forces them onto one worker in declaration order.
test.describe.serial("Phase 3: community interaction loop", () => {
  let owner: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let member: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let outsider: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let org: Awaited<ReturnType<typeof createTestOrganizationForUser>>;
  let board: Awaited<ReturnType<typeof createTestBoard>>;

  test.beforeAll(async () => {
    owner = await createConfirmedTestUser();
    member = await createConfirmedTestUser();
    outsider = await createConfirmedTestUser();
    org = await createTestOrganizationForUser(owner.id, "Community Org");
    await addTestMembership(org.id, member.id, "MEMBER");
    await setTestUsername(owner.id, `owner${owner.id.slice(0, 6)}`);

    const space = await createTestSpace(org.id, "Product");
    await createTestItemType(org.id, "Feature");
    await createTestStatus(org.id, "Open", true);
    await createTestPriority(org.id, "None", true);
    board = await createTestBoard(org.id, space.id, "Roadmap", {
      visibility: "PUBLIC",
    });
  });

  test.afterAll(async () => {
    await deleteTestOrganizationById(org.id);
    await deleteTestUser(owner.id);
    await deleteTestUser(member.id);
    await deleteTestUser(outsider.id);
  });

  test("owner submits an item; a member votes, follows, comments and mentions the owner; the owner sees activity and a notification", async ({
    page,
  }) => {
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}/boards/${board.slug}/items/new`);
    await page.getByLabel("Title").fill("Add dark mode");
    await page.getByLabel("Description").fill("Please add a dark theme.");
    await page.getByRole("button", { name: "Submit item" }).click();
    await expect(page).toHaveURL(/\/items\/add-dark-mode/);
    const itemUrl = page.url();

    // The owner is auto-followed as the item's author.
    await expect(
      page.getByRole("button", { name: /Following · 1/ }),
    ).toBeVisible();

    await page.getByRole("tab", { name: /Activity/ }).click();
    await expect(page.getByText(/created this item/)).toBeVisible();

    // The member logs in, votes, follows, and comments with a mention.
    await page.context().clearCookies();
    await login(page, member.email, member.password);
    await page.goto(itemUrl);

    await page.getByRole("button", { name: /▲ 0 votes/ }).click();
    await expect(page.getByRole("button", { name: /▲ 1 vote$/ })).toBeVisible();

    await page.getByRole("button", { name: /^Follow · 1/ }).click();
    await expect(
      page.getByRole("button", { name: /Following · 2/ }),
    ).toBeVisible();

    await page
      .getByPlaceholder(/Write a comment/)
      .fill(`Great idea, cc @owner${owner.id.slice(0, 6)}`);
    await page.getByRole("button", { name: "Comment", exact: true }).click();
    // Scoped to a rendered comment <li>, not the textarea — getByText
    // alone would also match the textarea's own (not-yet-cleared) value
    // while the create request is still in flight, resolving before the
    // comment is actually persisted.
    await expect(
      page.locator("li").filter({ hasText: "Great idea, cc @owner" }),
    ).toBeVisible();

    await page.getByRole("tab", { name: /Activity/ }).click();
    await expect(page.getByText(/voted/)).toBeVisible();
    await expect(page.getByText(/commented/)).toBeVisible();

    // The owner sees the unread notifications for the comment and the mention.
    await page.context().clearCookies();
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}`);
    await expect(
      page.getByRole("button", { name: /Notifications \(2 unread\)/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Notifications/ }).click();
    await expect(page.getByText(/commented on "Add dark mode"/)).toBeVisible();
    await expect(
      page.getByText(/mentioned you on "Add dark mode"/),
    ).toBeVisible();
  });

  test("an admin (the owner) can delete a member's comment (moderation), and a non-member gets a 404 on the item page (tenant isolation)", async ({
    page,
  }) => {
    await login(page, member.email, member.password);
    await page.goto(`/org/${org.slug}/boards/${board.slug}`);
    await page.getByRole("link", { name: "Add dark mode" }).click();
    await expect(page).toHaveURL(/\/items\/add-dark-mode/);
    const itemUrl = page.url();
    await page
      .getByPlaceholder(/Write a comment/)
      .fill("This should get removed");
    await page.getByRole("button", { name: "Comment", exact: true }).click();
    // See the equivalent comment in the test above — scoped to the
    // rendered <li>, not the textarea's own (transiently identical) value.
    await expect(
      page.locator("li").filter({ hasText: "This should get removed" }),
    ).toBeVisible();

    await page.context().clearCookies();
    await login(page, owner.email, owner.password);
    await page.goto(itemUrl);
    page.on("dialog", (dialog) => void dialog.accept());
    await page
      .locator("li", { hasText: "This should get removed" })
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(page.getByText("[deleted]")).toBeVisible();

    await page.context().clearCookies();
    await login(page, outsider.email, outsider.password);
    await page.goto(itemUrl);
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });

  test("search, status filter and most-voted sort work on the board page", async ({
    page,
  }) => {
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}/boards/${board.slug}/items/new`);
    await page.getByLabel("Title").fill("Unrelated bug report");
    await page.getByRole("button", { name: "Submit item" }).click();
    // Wait for the client-side router.push() that only fires after the
    // create Server Action resolves — otherwise the immediate page.goto()
    // below can cancel the in-flight request before the item is created.
    await expect(page).toHaveURL(/\/items\/unrelated-bug-report/);

    await page.goto(`/org/${org.slug}/boards/${board.slug}`);
    await expect(
      page.getByRole("link", { name: "Add dark mode" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Unrelated bug report" }),
    ).toBeVisible();

    await page.getByLabel("Search items").fill("dark mode");
    await page.getByRole("button", { name: "Filter" }).click();
    await expect(
      page.getByRole("link", { name: "Add dark mode" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Unrelated bug report" }),
    ).not.toBeVisible();

    await page.goto(`/org/${org.slug}/boards/${board.slug}`);
    await page.getByLabel("Sort items").selectOption("most-voted");
    await page.getByRole("button", { name: "Filter" }).click();
    // "Add dark mode" carries a vote from the earlier test and should sort
    // ahead of the unvoted "Unrelated bug report".
    const firstCardTitle = page
      .locator("a")
      .filter({ hasText: /Add dark mode|Unrelated bug report/ })
      .first();
    await expect(firstCardTitle).toHaveText("Add dark mode");
  });
});
