// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getUsageForOrganization } from "./queries";

/**
 * Pricing is per team: only items the team created count toward a plan's
 * item cap, so what the community submits never raises anyone's bill. One
 * throwaway organisation, then its profile.
 */
describe("item usage counts only team-created items", () => {
  const authorId = randomUUID();
  const slug = `item-origin-${randomUUID().slice(0, 8)}`;
  let orgId: string;

  beforeAll(async () => {
    await db.profile.create({ data: { id: authorId, displayName: "Author" } });
    const org = await db.organization.create({
      data: { name: "Origin Org", slug },
    });
    orgId = org.id;
    const [type, status, priority, space] = await Promise.all([
      db.itemType.create({
        data: { organizationId: orgId, name: "Idea", slug: "idea" },
      }),
      db.status.create({
        data: { organizationId: orgId, name: "Open", slug: "open" },
      }),
      db.priority.create({
        data: { organizationId: orgId, name: "None", slug: "none" },
      }),
      db.space.create({
        data: { organizationId: orgId, name: "Space", slug: "space" },
      }),
    ]);
    const board = await db.board.create({
      data: {
        organizationId: orgId,
        spaceId: space.id,
        name: "Board",
        slug: "board",
      },
    });
    const item = (s: string, extra: Record<string, unknown> = {}) =>
      db.item.create({
        data: {
          organizationId: orgId,
          spaceId: space.id,
          boardId: board.id,
          itemTypeId: type.id,
          statusId: status.id,
          priorityId: priority.id,
          authorId,
          title: s,
          slug: s,
          ...extra,
        },
      });
    await item("team-default"); // no origin given: must default to TEAM
    await item("team-explicit", { origin: "TEAM" });
    await item("community-a", { origin: "COMMUNITY" });
    await item("community-b", { origin: "COMMUNITY" });
    await item("team-deleted", { origin: "TEAM", deletedAt: new Date() });
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: orgId } });
    await db.profile.deleteMany({ where: { id: authorId } });
  });

  it("defaults an item's origin to TEAM", async () => {
    const item = await db.item.findFirstOrThrow({
      where: { organizationId: orgId, slug: "team-default" },
    });
    expect(item.origin).toBe("TEAM");
  });

  it("counts team items, and neither community nor deleted ones", async () => {
    const usage = await getUsageForOrganization(orgId);
    expect(usage.items).toBe(2);
  });
});
