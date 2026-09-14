// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import {
  getFollowerCountForItem,
  isFollowingItem,
  listFollowersForItem,
} from "./queries";
import { ensureFollowing } from "./ensure";
import { canFollowItem } from "./permissions";

describe("ItemFollower uniqueness", () => {
  const authorId = randomUUID();
  let orgId: string;
  let itemId: string;

  beforeAll(async () => {
    await db.profile.create({ data: { id: authorId, displayName: "Author" } });
    const org = await db.organization.create({
      data: {
        name: "Follower Test Org",
        slug: `follower-test-${randomUUID().slice(0, 8)}`,
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
    const item = await db.item.create({
      data: {
        organizationId: orgId,
        spaceId: space.id,
        boardId: board.id,
        itemTypeId: itemType.id,
        statusId: status.id,
        authorId,
        title: "Dark mode",
        slug: "dark-mode",
      },
    });
    itemId = item.id;
  });

  afterAll(async () => {
    await db.organization.delete({ where: { id: orgId } });
    await db.profile.deleteMany({ where: { id: authorId } });
  });

  it("ensureFollowing is idempotent — calling it twice creates one row", async () => {
    await ensureFollowing(db, itemId, authorId);
    await ensureFollowing(db, itemId, authorId);

    expect(await getFollowerCountForItem(itemId)).toBe(1);
    expect(await isFollowingItem(itemId, authorId)).toBe(true);

    await db.itemFollower.deleteMany({ where: { itemId } });
  });

  it("two concurrent follow attempts by the same user resolve to one row", async () => {
    const results = await Promise.allSettled([
      db.itemFollower.create({ data: { itemId, userId: authorId } }),
      db.itemFollower.create({ data: { itemId, userId: authorId } }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
    expect(await getFollowerCountForItem(itemId)).toBe(1);

    await db.itemFollower.deleteMany({ where: { itemId } });
  });

  it("listFollowersForItem includes the follower's Profile", async () => {
    await db.itemFollower.create({ data: { itemId, userId: authorId } });
    const followers = await listFollowersForItem(itemId);
    expect(followers).toHaveLength(1);
    expect(followers[0]!.user.id).toBe(authorId);

    await db.itemFollower.deleteMany({ where: { itemId } });
  });
});

describe("Follower permissions", () => {
  it("any org member can follow", () => {
    expect(canFollowItem("MEMBER")).toBe(true);
    expect(canFollowItem("OWNER")).toBe(true);
  });
});
