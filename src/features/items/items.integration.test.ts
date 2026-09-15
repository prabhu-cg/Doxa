// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getBoardBySlug, getVisibleBoard } from "@/features/boards/queries";
import {
  getItemForVisitor,
  getVisibleItem,
  listItemsForBoard,
} from "./queries";
import { canManageSpaces } from "@/features/spaces/permissions";
import { canManageBoards } from "@/features/boards/permissions";
import { canArchiveItem, canCreateItem, canEditItem } from "./permissions";

/**
 * Exercises tenant isolation across the Space → Board → Item hierarchy
 * added in Phase 2, the same way
 * features/organizations/organizations.integration.test.ts exercises it
 * for Organization/Membership: real Prisma queries against the real
 * Supabase Postgres instance, bypassing Server Actions (which need a live
 * Next.js request for cookies()/getAuthenticatedSupabaseUser()).
 *
 * getVisibleBoard/getVisibleItem's PRIVATE-board branch calls
 * getAuthenticatedSupabaseUser(), which needs a real request context this
 * test doesn't have — that branch (a signed-out or non-member visitor
 * denied a private board) is covered end-to-end instead, in
 * e2e/spaces-boards-items.spec.ts.
 */
describe("Space/Board/Item tenant isolation", () => {
  const authorId = randomUUID();
  let orgAId: string;
  let orgBId: string;
  const orgASlug = `test-org-a-${randomUUID().slice(0, 8)}`;
  const orgBSlug = `test-org-b-${randomUUID().slice(0, 8)}`;

  let spaceAId: string;
  let publicBoardId: string;
  let privateBoardId: string;
  const publicBoardSlug = "public-board";
  const privateBoardSlug = "private-board";
  const archivedBoardSlug = "archived-board";

  let itemTypeId: string;
  let statusId: string;
  let priorityId: string;

  beforeAll(async () => {
    await db.profile.create({
      data: { id: authorId, displayName: "Test Author" },
    });

    const orgA = await db.organization.create({
      data: { name: "Test Org A", slug: orgASlug },
    });
    orgAId = orgA.id;
    const orgB = await db.organization.create({
      data: { name: "Test Org B", slug: orgBSlug },
    });
    orgBId = orgB.id;

    const space = await db.space.create({
      data: { organizationId: orgAId, name: "Product", slug: "product" },
    });
    spaceAId = space.id;

    const itemType = await db.itemType.create({
      data: { organizationId: orgAId, name: "Feature", slug: "feature" },
    });
    itemTypeId = itemType.id;
    const status = await db.status.create({
      data: {
        organizationId: orgAId,
        name: "Open",
        slug: "open",
        isDefault: true,
      },
    });
    statusId = status.id;
    const priority = await db.priority.create({
      data: {
        organizationId: orgAId,
        name: "None",
        slug: "none",
        isDefault: true,
      },
    });
    priorityId = priority.id;

    const publicBoard = await db.board.create({
      data: {
        organizationId: orgAId,
        spaceId: spaceAId,
        name: "Public Board",
        slug: publicBoardSlug,
        visibility: "PUBLIC",
      },
    });
    publicBoardId = publicBoard.id;

    const privateBoard = await db.board.create({
      data: {
        organizationId: orgAId,
        spaceId: spaceAId,
        name: "Private Board",
        slug: privateBoardSlug,
        visibility: "PRIVATE",
      },
    });
    privateBoardId = privateBoard.id;

    await db.board.create({
      data: {
        organizationId: orgAId,
        spaceId: spaceAId,
        name: "Archived Board",
        slug: archivedBoardSlug,
        visibility: "PUBLIC",
        status: "ARCHIVED",
      },
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    });
    await db.profile.deleteMany({ where: { id: authorId } });
  });

  it("returns a PUBLIC, ACTIVE board for any visitor with no session", async () => {
    const visible = await getVisibleBoard(orgASlug, publicBoardSlug);
    expect(visible).not.toBeNull();
    expect(visible?.board.id).toBe(publicBoardId);
  });

  it("returns null for a nonexistent organisation slug", async () => {
    expect(await getVisibleBoard("no-such-org", publicBoardSlug)).toBeNull();
  });

  it("returns null for a board slug that belongs to a different organisation (IDOR)", async () => {
    expect(await getVisibleBoard(orgBSlug, publicBoardSlug)).toBeNull();
  });

  it("returns null for an archived board even if it's PUBLIC", async () => {
    expect(await getVisibleBoard(orgASlug, archivedBoardSlug)).toBeNull();
  });

  it("getBoardBySlug is scoped to the given organisation only", async () => {
    expect(await getBoardBySlug(orgAId, publicBoardSlug)).not.toBeNull();
    expect(await getBoardBySlug(orgBId, publicBoardSlug)).toBeNull();
  });

  it("getBoardBySlug (the admin-facing lookup) isn't visibility-filtered — it's used after requireOrganizationMembership already gated access", async () => {
    const board = await getBoardBySlug(orgAId, privateBoardSlug);
    expect(board?.id).toBe(privateBoardId);
  });

  describe("Items on the public board", () => {
    let visibleItemId: string;
    let archivedItemId: string;
    let deletedItemId: string;

    beforeAll(async () => {
      const visibleItem = await db.item.create({
        data: {
          organizationId: orgAId,
          spaceId: spaceAId,
          boardId: publicBoardId,
          itemTypeId,
          statusId,
          priorityId,
          authorId,
          title: "Add dark mode",
          slug: "add-dark-mode",
        },
      });
      visibleItemId = visibleItem.id;

      const archivedItem = await db.item.create({
        data: {
          organizationId: orgAId,
          spaceId: spaceAId,
          boardId: publicBoardId,
          itemTypeId,
          statusId,
          priorityId,
          authorId,
          title: "Archived idea",
          slug: "archived-idea",
          archivedAt: new Date(),
        },
      });
      archivedItemId = archivedItem.id;

      const deletedItem = await db.item.create({
        data: {
          organizationId: orgAId,
          spaceId: spaceAId,
          boardId: publicBoardId,
          itemTypeId,
          statusId,
          priorityId,
          authorId,
          title: "Deleted idea",
          slug: "deleted-idea",
          deletedAt: new Date(),
        },
      });
      deletedItemId = deletedItem.id;
    });

    afterAll(async () => {
      await db.item.deleteMany({
        where: { id: { in: [visibleItemId, archivedItemId, deletedItemId] } },
      });
    });

    it("a visitor sees the visible item via getVisibleItem", async () => {
      const visible = await getVisibleItem(
        orgASlug,
        publicBoardSlug,
        "add-dark-mode",
      );
      expect(visible).not.toBeNull();
      expect(visible?.item.id).toBe(visibleItemId);
    });

    it("a visitor cannot see an archived item", async () => {
      expect(
        await getVisibleItem(orgASlug, publicBoardSlug, "archived-idea"),
      ).toBeNull();
    });

    it("a visitor cannot see a deleted item even via the org-member query", async () => {
      expect(await getItemForVisitor(publicBoardId, "deleted-idea")).toBeNull();
    });

    it("a visitor cannot reach an item through a mismatched organisation (malicious IDs)", async () => {
      // The equivalent check against a mismatched PRIVATE board is covered
      // in e2e/spaces-boards-items.spec.ts — that branch of getVisibleBoard
      // needs a real request context (see the file-level comment above).
      expect(
        await getVisibleItem(orgBSlug, publicBoardSlug, "add-dark-mode"),
      ).toBeNull();
    });

    it("the default (non-admin) board listing excludes archived and deleted items", async () => {
      const items = await listItemsForBoard(publicBoardId);
      const ids = items.map((i) => i.id);
      expect(ids).toContain(visibleItemId);
      expect(ids).not.toContain(archivedItemId);
      expect(ids).not.toContain(deletedItemId);
    });

    it("includeArchived surfaces the archived item but never the deleted one", async () => {
      const items = await listItemsForBoard(
        publicBoardId,
        {},
        { includeArchived: true },
      );
      const ids = items.map((i) => i.id);
      expect(ids).toContain(archivedItemId);
      expect(ids).not.toContain(deletedItemId);
    });

    it("filters by search text", async () => {
      const items = await listItemsForBoard(publicBoardId, { q: "dark mode" });
      expect(items.map((i) => i.id)).toEqual([visibleItemId]);
    });
  });

  describe("Search, tag filtering and sorting (Phase 3)", () => {
    let lowVoteId: string;
    let highVoteId: string;
    let taggedId: string;
    let tagId: string;
    const voterAId = randomUUID();
    const voterBId = randomUUID();

    beforeAll(async () => {
      await db.profile.createMany({
        data: [
          { id: voterAId, displayName: "Voter A" },
          { id: voterBId, displayName: "Voter B" },
        ],
      });

      const tag = await db.tag.create({
        data: { organizationId: orgAId, name: "ux", slug: "ux" },
      });
      tagId = tag.id;

      const low = await db.item.create({
        data: {
          organizationId: orgAId,
          spaceId: spaceAId,
          boardId: publicBoardId,
          itemTypeId,
          statusId,
          priorityId,
          authorId,
          title: "Low vote item",
          slug: "low-vote-item",
        },
      });
      lowVoteId = low.id;

      const high = await db.item.create({
        data: {
          organizationId: orgAId,
          spaceId: spaceAId,
          boardId: publicBoardId,
          itemTypeId,
          statusId,
          priorityId,
          authorId,
          title: "High vote item",
          slug: "high-vote-item",
          tags: { create: [{ tagId }] },
        },
      });
      highVoteId = high.id;
      taggedId = high.id;

      await db.vote.createMany({
        data: [
          { itemId: high.id, userId: authorId },
          { itemId: high.id, userId: voterAId },
          { itemId: high.id, userId: voterBId },
          { itemId: low.id, userId: authorId },
        ],
      });
    });

    afterAll(async () => {
      await db.vote.deleteMany({
        where: { itemId: { in: [lowVoteId, highVoteId] } },
      });
      await db.item.deleteMany({
        where: { id: { in: [lowVoteId, highVoteId] } },
      });
      await db.tag.delete({ where: { id: tagId } });
      await db.profile.deleteMany({
        where: { id: { in: [voterAId, voterBId] } },
      });
    });

    it("sort=most-voted orders items by vote count, descending", async () => {
      const items = await listItemsForBoard(publicBoardId, {
        sort: "most-voted",
      });
      const highIndex = items.findIndex((i) => i.id === highVoteId);
      const lowIndex = items.findIndex((i) => i.id === lowVoteId);
      expect(highIndex).toBeGreaterThanOrEqual(0);
      expect(lowIndex).toBeGreaterThan(highIndex);
    });

    it("filters by tag slug", async () => {
      const items = await listItemsForBoard(publicBoardId, { tagSlug: "ux" });
      expect(items.map((i) => i.id)).toEqual([taggedId]);
    });

    it("includes vote and comment counts on every item", async () => {
      const items = await listItemsForBoard(publicBoardId, { tagSlug: "ux" });
      expect(items[0]!._count.votes).toBe(3);
      expect(items[0]!._count.comments).toBe(0);
    });
  });
});

describe("Space/Board/Item permission matrix", () => {
  it("only owners and admins can manage spaces and boards", () => {
    expect(canManageSpaces("OWNER")).toBe(true);
    expect(canManageSpaces("ADMIN")).toBe(true);
    expect(canManageSpaces("MEMBER")).toBe(false);
    expect(canManageBoards("OWNER")).toBe(true);
    expect(canManageBoards("MEMBER")).toBe(false);
  });

  it("any member can create an item", () => {
    expect(canCreateItem("MEMBER")).toBe(true);
    expect(canCreateItem("ADMIN")).toBe(true);
    expect(canCreateItem("OWNER")).toBe(true);
  });

  it("only the author or an admin+ can edit/archive an item", () => {
    expect(canEditItem("MEMBER", true)).toBe(true); // author
    expect(canEditItem("MEMBER", false)).toBe(false); // not author, not admin
    expect(canEditItem("ADMIN", false)).toBe(true); // admin moderation
    expect(canArchiveItem("MEMBER", true)).toBe(true);
    expect(canArchiveItem("MEMBER", false)).toBe(false);
    expect(canArchiveItem("OWNER", false)).toBe(true);
  });
});
