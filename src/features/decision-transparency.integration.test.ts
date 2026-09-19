// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import {
  getCurrentDecisionTypesForItems,
  getResponseSummaryForBoard,
  listPublicDecisionsForItem,
} from "./decisions/transparency";

/**
 * What the public pages may show of a decision, and the responsiveness
 * figures, against the real database like the other integration tests. One
 * throwaway organisation, deleted afterwards, then its profile.
 */
describe("decision transparency", () => {
  const profileId = randomUUID();
  const slug = `transparency-${randomUUID().slice(0, 8)}`;
  let orgId: string;
  let boardId: string;
  let itemA: string; // two decisions, the first with private notes
  let itemB: string; // one decision
  let itemC: string; // undecided
  let itemD: string; // archived, decided — must not count

  const at = (iso: string) => new Date(`${iso}T00:00:00Z`);

  beforeAll(async () => {
    await db.profile.create({
      data: { id: profileId, displayName: "Decider" },
    });
    const org = await db.organization.create({
      data: { name: "Transparency Org", slug },
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
    boardId = board.id;

    const item = (name: string, created: string, archived = false) =>
      db.item.create({
        data: {
          organizationId: orgId,
          spaceId: space.id,
          boardId,
          itemTypeId: type.id,
          statusId: status.id,
          priorityId: priority.id,
          authorId: profileId,
          title: name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          createdAt: at(created),
          ...(archived ? { archivedAt: new Date() } : {}),
        },
      });
    const [a, b, c, dItem] = await Promise.all([
      item("Item A", "2024-01-01"),
      item("Item B", "2024-01-01"),
      item("Item C", "2024-01-01"),
      item("Item D", "2024-01-01", true),
    ]);
    itemA = a.id;
    itemB = b.id;
    itemC = c.id;
    itemD = dItem.id;

    const decide = (
      itemId: string,
      type: "DEFERRED" | "PLANNED" | "DECLINED",
      created: string,
      extra: {
        internalNotes?: string;
        roadmapStage?: "NOW" | "NEXT" | "LATER";
      } = {},
    ) =>
      db.decision.create({
        data: {
          organizationId: orgId,
          itemId,
          type,
          rationale: `Because ${type}`,
          createdById: profileId,
          createdAt: at(created),
          ...extra,
        },
      });
    await decide(itemA, "DEFERRED", "2024-01-02", {
      internalNotes: "SECRET NOTE",
    }); // 1 day
    await decide(itemA, "PLANNED", "2024-02-01", { roadmapStage: "NEXT" });
    await decide(itemB, "DECLINED", "2024-01-04"); // 3 days
    await decide(itemD, "PLANNED", "2024-01-02");
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: orgId } });
    await db.profile.deleteMany({ where: { id: profileId } });
  });

  it("lists an item's whole decision history, newest first", async () => {
    const history = await listPublicDecisionsForItem(itemA);
    expect(history.map((d) => d.type)).toEqual(["PLANNED", "DEFERRED"]);
    expect(history[0].roadmapStage).toBe("NEXT");
  });

  it("never carries internal notes or who decided", async () => {
    const history = await listPublicDecisionsForItem(itemA);
    for (const decision of history) {
      expect(Object.keys(decision).sort()).toEqual(
        [
          "createdAt",
          "id",
          "rationale",
          "roadmapStage",
          "targetDate",
          "type",
        ].sort(),
      );
    }
    expect(JSON.stringify(history)).not.toContain("SECRET NOTE");
    expect(JSON.stringify(history)).not.toContain(profileId);
  });

  it("gives each item's current decision and omits undecided ones", async () => {
    const current = await getCurrentDecisionTypesForItems([
      itemA,
      itemB,
      itemC,
    ]);
    expect(current.get(itemA)).toBe("PLANNED");
    expect(current.get(itemB)).toBe("DECLINED");
    expect(current.has(itemC)).toBe(false);
  });

  it("returns nothing for no items", async () => {
    expect((await getCurrentDecisionTypesForItems([])).size).toBe(0);
  });

  it("summarises responsiveness over live items only, from the first decision", async () => {
    const summary = await getResponseSummaryForBoard(boardId);
    // A (first decision after 1 day), B (3 days), C undecided; D is archived.
    expect(summary).toEqual({ total: 3, answered: 2, medianDays: 2 });
  });
});
