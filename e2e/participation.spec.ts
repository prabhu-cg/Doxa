import { test, expect, type Page } from "@playwright/test";
import {
  createConfirmedTestUser,
  createTestBoard,
  createTestItem,
  createTestItemType,
  createTestOrganizationForUser,
  createTestPriority,
  createTestSpace,
  createTestStatus,
  deleteTestOrganizationById,
  deleteTestUser,
} from "./utils/test-users";

async function login(
  page: Page,
  email: string,
  password: string,
  next?: string,
) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login/);
  // Let the page finish loading its scripts: typing into a form before it has
  // hydrated loses the click, and the test then fails for no reason of the app's.
  await page.waitForLoadState("networkidle");
}

/**
 * The customer journey on a public board: someone who is not a member of the
 * organisation signs in from the page they were looking at, votes, follows,
 * comments and submits an idea; the team reviews it, and can block them.
 * The permission and rate-limit rules behind this are covered by
 * features/participation/*.integration.test.ts — this is the wiring.
 */
test.describe.serial("Customer participation on a public board", () => {
  let owner: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let customer: Awaited<ReturnType<typeof createConfirmedTestUser>>;
  let org: Awaited<ReturnType<typeof createTestOrganizationForUser>>;
  let board: Awaited<ReturnType<typeof createTestBoard>>;
  let item: Awaited<ReturnType<typeof createTestItem>>;
  let publicItem: string;
  let publicBoard: string;

  test.beforeAll(async () => {
    owner = await createConfirmedTestUser();
    customer = await createConfirmedTestUser();
    org = await createTestOrganizationForUser(owner.id, "Participation Org");
    const space = await createTestSpace(org.id, "Product");
    const type = await createTestItemType(org.id, "Feature");
    const status = await createTestStatus(org.id, "Open", true);
    const priority = await createTestPriority(org.id, "None", true);
    board = await createTestBoard(org.id, space.id, "Ideas", {
      visibility: "PUBLIC",
    });
    item = await createTestItem({
      organizationId: org.id,
      spaceId: space.id,
      boardId: board.id,
      itemTypeId: type.id,
      statusId: status.id,
      priorityId: priority.id,
      authorId: owner.id,
      title: "Add dark mode",
    });
    publicBoard = `/b/${org.slug}/${board.slug}`;
    publicItem = `${publicBoard}/${item.slug}`;
  });

  test.afterAll(async () => {
    await deleteTestOrganizationById(org.id);
    await deleteTestUser(owner.id);
    await deleteTestUser(customer.id);
  });

  test("a signed-out visitor is asked to sign in, and comes back to the same page", async ({
    page,
  }) => {
    await page.goto(publicItem);
    await expect(
      page.getByRole("link", { name: /^Sign in to vote/ }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /vote/ })).toHaveCount(0);

    await page.goto(publicBoard);
    await page.getByRole("button", { name: "Submit item" }).click();
    await expect(page.getByText(/to submit item\./)).toBeVisible();

    await page.goto(publicItem);
    await page.getByRole("link", { name: "Sign in" }).first().click();
    await expect(page).toHaveURL(/\/login\?next=/);
    await page.getByLabel("Email").fill(customer.email);
    await page.getByLabel("Password", { exact: true }).fill(customer.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(publicItem);
  });

  test("a customer can vote, follow and comment — the vote survives a reload", async ({
    page,
  }) => {
    await login(page, customer.email, customer.password, publicItem);
    await page.getByRole("button", { name: "0 votes" }).click();
    await expect(page.getByRole("button", { name: "1 vote" })).toBeVisible();
    await page.getByRole("button", { name: /^Follow/ }).click();
    await expect(page.getByRole("button", { name: /Following/ })).toBeVisible();

    await page
      .getByLabel("Write a comment…")
      .fill("Yes please, at night I need it");
    await page.getByRole("button", { name: "Comment" }).click();
    await expect(
      page.getByText("Yes please, at night I need it"),
    ).toBeVisible();

    // The vote and follow buttons update before the server has answered; the
    // comment count comes from the server, and the actions run in order — so
    // once it shows, all three are saved and a reload can't cut them off.
    await expect(
      page.getByRole("heading", { name: "Discussion 1" }),
    ).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "1 vote" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("button", { name: /Following/ })).toBeVisible();
    await expect(
      page.getByText("Yes please, at night I need it"),
    ).toBeVisible();
  });

  test("a customer's submission waits for review, and only they can see it", async ({
    page,
    browser,
  }) => {
    await login(page, customer.email, customer.password, publicBoard);
    await page.getByRole("button", { name: "Submit item" }).click();
    await page.getByLabel("Title").fill("Export to CSV");
    await page.getByLabel("Details").fill("I need my data in a spreadsheet.");
    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await expect(page.getByText("Thanks — we've got it.")).toBeVisible();

    await page.getByRole("link", { name: "View your submission" }).click();
    await expect(page.getByText("Waiting for review")).toBeVisible();
    const pendingUrl = page.url();

    // Nobody else sees it: not on the board, and not by its link.
    const stranger = await browser.newContext();
    const strangerPage = await stranger.newPage();
    await strangerPage.goto(publicBoard);
    await expect(strangerPage.getByText("Add dark mode")).toBeVisible();
    await expect(strangerPage.getByText("Export to CSV")).toHaveCount(0);
    await strangerPage.goto(pendingUrl);
    await expect(
      strangerPage.getByText("This page could not be found"),
    ).toBeVisible();
    await stranger.close();
  });

  test("the team approves it, and it appears on the public board", async ({
    page,
    browser,
  }) => {
    await login(page, owner.email, owner.password);
    await page.goto(`/org/${org.slug}/boards/${board.slug}`);
    await expect(page.getByText("Needs review")).toBeVisible();
    await page.getByRole("link", { name: "Export to CSV" }).click();
    await expect(page.getByText("Waiting for review")).toBeVisible();
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(0);

    const visitor = await browser.newContext();
    const visitorPage = await visitor.newPage();
    await visitorPage.goto(publicBoard);
    await expect(visitorPage.getByText("Export to CSV")).toBeVisible();
    await visitor.close();
  });

  test("the board is a grid: vote from a row, open an item in a drawer, filter", async ({
    page,
  }) => {
    await login(page, customer.email, customer.password, publicBoard);

    // Two items are listed now (the seeded one and the approved submission).
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(2);

    // The vote is right in the row — no need to open anything.
    const row = rows.filter({ hasText: "Export to CSV" });
    await row.getByRole("button", { name: /^Vote for Export to CSV/ }).click();
    await expect(
      row.getByRole("button", { name: /^Remove your vote from Export to CSV/ }),
    ).toHaveAttribute("aria-pressed", "true");

    // Clicking a row opens its item in a drawer over the list, at a shareable address.
    await rows
      .filter({ hasText: "Add dark mode" })
      .getByRole("link", { name: "Add dark mode", exact: true })
      .click();
    const drawer = page.getByRole("dialog");
    await expect(drawer.getByText("Add dark mode")).toBeVisible();
    await expect(page).toHaveURL(/[?&]item=/);
    await expect(rows).toHaveCount(2); // the list is still behind it

    // A vote made in the drawer shows in the grid row behind it, and the other way
    // round. (This customer voted for this item in an earlier test.)
    // (Located by attribute: an open drawer hides the page behind it from role queries.)
    const chip = rows
      .filter({ hasText: "Add dark mode" })
      .locator("button[aria-pressed]");
    const drawerVote = drawer.getByRole("button", { name: /votes?$/ });
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await drawerVote.click();
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await chip.dispatchEvent("click"); // the drawer's scrim covers it; act as the chip's own click
    await expect(drawerVote).toHaveAttribute("aria-pressed", "true");

    // Closing returns to the plain board.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).not.toHaveURL(/item=/);

    // Search narrows the grid, and is in the address.
    await page.getByRole("searchbox", { name: /Search/ }).fill("CSV");
    await expect(rows).toHaveCount(1);
    await expect(page).toHaveURL(/q=CSV/);
  });

  test("the team's reply is labelled, and blocking a customer stops them taking part", async ({
    page,
    browser,
  }) => {
    // The customer already has the page open when they are blocked.
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await login(customerPage, customer.email, customer.password, publicItem);
    await expect(
      customerPage.getByRole("button", { name: "1 vote" }),
    ).toBeVisible();

    await login(page, owner.email, owner.password, publicItem);
    await page.getByLabel(/Write a comment/).fill("Thanks — planning this");
    await page.getByRole("button", { name: "Comment" }).click();
    await expect(
      page.getByRole("heading", { name: "Discussion 2" }),
    ).toBeVisible();
    await expect(page.getByText("Team", { exact: true })).toBeVisible();

    page.on("dialog", (dialog) => void dialog.accept());
    await page
      .locator("li", { hasText: "Yes please, at night I need it" })
      .getByRole("button", { name: "Block" })
      .click();
    await expect(page.getByText("Blocked", { exact: true })).toBeVisible();

    // The server refuses even though the page still shows a vote button…
    await customerPage.getByRole("button", { name: "1 vote" }).click();
    await expect(
      customerPage.getByText("You can't take part in this community"),
    ).toBeVisible();

    // …and a fresh load no longer offers one, and shows the team's label.
    await customerPage.reload();
    await expect(
      customerPage.getByRole("button", { name: /vote/ }),
    ).toHaveCount(0);
    await expect(
      customerPage.getByText("You can't take part in this community").first(),
    ).toBeVisible();
    await expect(customerPage.getByText("Team", { exact: true })).toBeVisible();
    await customerContext.close();
  });
});
