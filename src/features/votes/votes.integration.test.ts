// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getVoteCountForItem, hasUserVotedForItem } from "./queries";
import { canVoteOnItem } from "./permissions";

/**
 * Exercises the Vote model's uniqueness/race-safety guarantee and its
 * query helpers directly against the real Supabase Postgres instance,
 * bypassing the addVote/removeVote Server Actions (which need a live
 * Next.js request for cookies()/getAuthenticatedSupabaseUser() — see the
 * equivalent note in features/items/items.integration.test.ts). The
 * Server Action layer's own idempotent-P2002-handling is exercised
 * end-to-end in e2e/community.spec.ts.
 */
describe("Vote uniqueness and race safety", () => {
  const authorId = randomUUID();
  const voterId = randomUUID();
  let orgId: string;
  let itemId: string;

  beforeAll(async () => {
    await db.profile.createMany({
      data: [
        { id: authorId, displayName: "Author" },
        { id: voterId, displayName: "Voter" },
      ],
    });
    const org = await db.organization.create({
      data: {
        name: "Vote Test Org",
        slug: `vote-test-${randomUUID().slice(0, 8)}`,
      },
    });
    orgId = org.id;
    const space = await db.space.create({
      data: { organizationId: orgId, name: "Product", slug: "product" },
    });
    const board = await db.board.create({
      data: {
        organizationId: orgId,
        spaceId: space.id,
        name: "Board",
        slug: "board",
      },
    });
    const itemType = await db.itemType.create({
      data: { organizationId: orgId, name: "Feature", slug: "feature" },
    });
    const status = await db.status.create({
      data: {
        organizationId: orgId,
        name: "Open",
        slug: "open",
        isDefault: true,
      },
    });
    const priority = await db.priority.create({
      data: {
        organizationId: orgId,
        name: "None",
        slug: "none",
        isDefault: true,
      },
    });
    const item = await db.item.create({
      data: {
        organizationId: orgId,
        spaceId: space.id,
        boardId: board.id,
        itemTypeId: itemType.id,
        statusId: status.id,
        priorityId: priority.id,
        authorId,
        title: "Dark mode",
        slug: "dark-mode",
      },
    });
    itemId = item.id;
  });

  afterAll(async () => {
    await db.organization.delete({ where: { id: orgId } });
    await db.profile.deleteMany({ where: { id: { in: [authorId, voterId] } } });
  });

  it("two concurrent votes from the same user for the same item resolve to exactly one row", async () => {
    const results = await Promise.allSettled([
      db.vote.create({ data: { itemId, userId: voterId } }),
      db.vote.create({ data: { itemId, userId: voterId } }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    expect(await getVoteCountForItem(itemId)).toBe(1);
    expect(await hasUserVotedForItem(itemId, voterId)).toBe(true);

    await db.vote.deleteMany({ where: { itemId, userId: voterId } });
  });

  it("a second vote by a different user increments the count independently", async () => {
    const otherVoterId = randomUUID();
    await db.profile.create({
      data: { id: otherVoterId, displayName: "Other Voter" },
    });

    await db.vote.create({ data: { itemId, userId: voterId } });
    await db.vote.create({ data: { itemId, userId: otherVoterId } });

    expect(await getVoteCountForItem(itemId)).toBe(2);

    await db.vote.deleteMany({ where: { itemId } });
    await db.profile.delete({ where: { id: otherVoterId } });
  });

  it("removing a vote is reflected in the count and hasUserVotedForItem", async () => {
    await db.vote.create({ data: { itemId, userId: voterId } });
    expect(await hasUserVotedForItem(itemId, voterId)).toBe(true);

    await db.vote.deleteMany({ where: { itemId, userId: voterId } });
    expect(await hasUserVotedForItem(itemId, voterId)).toBe(false);
    expect(await getVoteCountForItem(itemId)).toBe(0);
  });
});

describe("Vote permissions", () => {
  it("any org member (including MEMBER) can vote", () => {
    expect(canVoteOnItem("MEMBER")).toBe(true);
    expect(canVoteOnItem("ADMIN")).toBe(true);
    expect(canVoteOnItem("OWNER")).toBe(true);
  });
});
