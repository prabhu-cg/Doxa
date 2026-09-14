// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { logActivity } from "./log";
import { listActivityForItem } from "./queries";

describe("ItemActivity logging", () => {
  const actorId = randomUUID();
  let orgId: string;
  let itemId: string;

  beforeAll(async () => {
    await db.profile.create({ data: { id: actorId, displayName: "Actor" } });
    const org = await db.organization.create({
      data: {
        name: "Activity Test Org",
        slug: `activity-test-${randomUUID().slice(0, 8)}`,
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
        authorId: actorId,
        title: "Dark mode",
        slug: "dark-mode",
      },
    });
    itemId = item.id;
  });

  afterAll(async () => {
    await db.organization.delete({ where: { id: orgId } });
    await db.profile.deleteMany({ where: { id: actorId } });
  });

  it("logActivity writes a row carrying its data payload, and listActivityForItem returns it newest-first with its actor", async () => {
    await logActivity(db, { itemId, actorId, type: "ITEM_CREATED" });
    await logActivity(db, {
      itemId,
      actorId,
      type: "STATUS_CHANGED",
      data: { fromStatus: "Open", toStatus: "Planned" },
    });

    const activities = await listActivityForItem(itemId);
    expect(activities).toHaveLength(2);
    // Newest first.
    expect(activities[0]!.type).toBe("STATUS_CHANGED");
    expect(activities[0]!.data).toMatchObject({
      fromStatus: "Open",
      toStatus: "Planned",
    });
    expect(activities[0]!.actor?.id).toBe(actorId);
    expect(activities[1]!.type).toBe("ITEM_CREATED");

    await db.itemActivity.deleteMany({ where: { itemId } });
  });

  it("logActivity accepts a null actor for system-triggered entries", async () => {
    await logActivity(db, { itemId, actorId: null, type: "ITEM_EDITED" });
    const activities = await listActivityForItem(itemId);
    expect(activities[0]!.actor).toBeNull();

    await db.itemActivity.deleteMany({ where: { itemId } });
  });
});
