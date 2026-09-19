// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { notifyDecisionRecorded } from "./notifications/create";

/**
 * Who hears about a decision: everyone who voted on the item or follows it,
 * once each, and never whoever recorded it. Against the real database like the
 * other integration tests; one throwaway organisation, then its profiles.
 */
describe("notifyDecisionRecorded", () => {
  const ids = {
    actor: randomUUID(), // recorded the decision (also author, follower and voter)
    voter: randomUUID(), // voted only
    follower: randomUUID(), // follows only
    both: randomUUID(), // voted and follows
    bystander: randomUUID(), // neither
  };
  const slug = `decision-notify-${randomUUID().slice(0, 8)}`;
  let orgId: string;
  let itemId: string;
  let quietItemId: string;

  beforeAll(async () => {
    await db.profile.createMany({
      data: Object.entries(ids).map(([name, id]) => ({
        id,
        displayName: name,
      })),
    });
    const org = await db.organization.create({
      data: { name: "Notify Org", slug },
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
    const item = (title: string, s: string) =>
      db.item.create({
        data: {
          organizationId: orgId,
          spaceId: space.id,
          boardId: board.id,
          itemTypeId: type.id,
          statusId: status.id,
          priorityId: priority.id,
          authorId: ids.actor,
          title,
          slug: s,
        },
      });
    const [busy, quiet] = await Promise.all([
      item("Busy", "busy"),
      item("Quiet", "quiet"),
    ]);
    itemId = busy.id;
    quietItemId = quiet.id;

    await db.vote.createMany({
      data: [ids.actor, ids.voter, ids.both].map((userId) => ({
        itemId,
        userId,
      })),
    });
    await db.itemFollower.createMany({
      data: [ids.actor, ids.follower, ids.both].map((userId) => ({
        itemId,
        userId,
      })),
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: orgId } });
    await db.profile.deleteMany({ where: { id: { in: Object.values(ids) } } });
  });

  const notified = async (id: string) =>
    (await db.notification.findMany({ where: { itemId: id } })).sort((a, b) =>
      a.userId.localeCompare(b.userId),
    );

  it("notifies voters and followers, once each, and not the person who decided", async () => {
    await notifyDecisionRecorded({
      organizationId: orgId,
      itemId,
      actorId: ids.actor,
      decisionType: "PLANNED",
      roadmapStage: "NEXT",
    });
    const rows = await notified(itemId);
    expect(rows.map((r) => r.userId).sort()).toEqual(
      [ids.voter, ids.follower, ids.both].sort(),
    );
    for (const row of rows) {
      expect(row.type).toBe("ITEM_DECISION");
      expect(row.actorId).toBe(ids.actor);
      expect(row.data).toEqual({
        decisionType: "PLANNED",
        roadmapStage: "NEXT",
      });
    }
  });

  it("leaves out the roadmap stage when none was set", async () => {
    await db.notification.deleteMany({ where: { itemId } });
    await notifyDecisionRecorded({
      organizationId: orgId,
      itemId,
      actorId: ids.actor,
      decisionType: "DECLINED",
    });
    const [row] = await notified(itemId);
    expect(row.data).toEqual({ decisionType: "DECLINED" });
  });

  it("does nothing, without error, when nobody voted or follows", async () => {
    await notifyDecisionRecorded({
      organizationId: orgId,
      itemId: quietItemId,
      actorId: ids.actor,
      decisionType: "PLANNED",
    });
    expect(await notified(quietItemId)).toEqual([]);
  });
});
