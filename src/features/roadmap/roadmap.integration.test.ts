// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { listRoadmapForOrganization } from "./queries";

/**
 * Exercises the basic Now/Next/Later roadmap view: only Items whose
 * CURRENT decision explicitly set a roadmapStage appear, an Item is never
 * placed there by vote count alone, and the view is scoped to one
 * organisation. See docs/architecture.md's "Roadmap" section and the
 * Decision model's doc comment in prisma/schema.prisma.
 */
describe("Roadmap view", () => {
  const authorId = randomUUID();
  let orgAId: string;
  let orgBId: string;
  let noStageItemId: string;
  let nextItemHighPriorityId: string;
  let nextItemLowPriorityId: string;
  let nowItemId: string;
  let archivedRoadmapItemId: string;

  beforeAll(async () => {
    await db.profile.create({ data: { id: authorId, displayName: "Author" } });

    const orgA = await db.organization.create({
      data: {
        name: "Roadmap Org A",
        slug: `roadmap-a-${randomUUID().slice(0, 8)}`,
      },
    });
    orgAId = orgA.id;
    const orgB = await db.organization.create({
      data: {
        name: "Roadmap Org B",
        slug: `roadmap-b-${randomUUID().slice(0, 8)}`,
      },
    });
    orgBId = orgB.id;

    const space = await db.space.create({
      data: { organizationId: orgAId, name: "Product", slug: "product" },
    });
    const board = await db.board.create({
      data: {
        organizationId: orgAId,
        spaceId: space.id,
        name: "Board",
        slug: "board",
      },
    });
    const itemType = await db.itemType.create({
      data: { organizationId: orgAId, name: "Feature", slug: "feature" },
    });
    const status = await db.status.create({
      data: {
        organizationId: orgAId,
        name: "Open",
        slug: "open",
        isDefault: true,
      },
    });
    const lowPriority = await db.priority.create({
      data: {
        organizationId: orgAId,
        name: "Low",
        slug: "low",
        sortOrder: 1,
        isDefault: true,
      },
    });
    const highPriority = await db.priority.create({
      data: {
        organizationId: orgAId,
        name: "High",
        slug: "high",
        sortOrder: 3,
      },
    });

    async function makeItem(title: string, slug: string, priorityId: string) {
      return db.item.create({
        data: {
          organizationId: orgAId,
          spaceId: space.id,
          boardId: board.id,
          itemTypeId: itemType.id,
          statusId: status.id,
          priorityId,
          authorId,
          title,
          slug,
        },
      });
    }

    const noStageItem = await makeItem("No stage", "no-stage", lowPriority.id);
    noStageItemId = noStageItem.id;
    await db.decision.create({
      data: {
        organizationId: orgAId,
        itemId: noStageItem.id,
        type: "DECLINED",
        rationale: "Not aligned with current architecture and demand is low.",
        createdById: authorId,
      },
    });

    const nextHigh = await makeItem(
      "Next, high priority",
      "next-high",
      highPriority.id,
    );
    nextItemHighPriorityId = nextHigh.id;
    await db.decision.create({
      data: {
        organizationId: orgAId,
        itemId: nextHigh.id,
        type: "PLANNED",
        rationale: "High priority, scheduled for the following cycle.",
        createdById: authorId,
        roadmapStage: "NEXT",
      },
    });

    const nextLow = await makeItem(
      "Next, low priority",
      "next-low",
      lowPriority.id,
    );
    nextItemLowPriorityId = nextLow.id;
    await db.decision.create({
      data: {
        organizationId: orgAId,
        itemId: nextLow.id,
        type: "PLANNED",
        rationale: "Lower priority but still queued for next.",
        createdById: authorId,
        roadmapStage: "NEXT",
      },
    });

    const nowItem = await makeItem("Now", "now-item", highPriority.id);
    nowItemId = nowItem.id;
    await db.decision.create({
      data: {
        organizationId: orgAId,
        itemId: nowItem.id,
        type: "IN_PROGRESS",
        rationale: "Actively being built this cycle.",
        createdById: authorId,
        roadmapStage: "NOW",
      },
    });

    const archivedItem = await makeItem(
      "Archived but on roadmap",
      "archived-roadmap",
      highPriority.id,
    );
    archivedRoadmapItemId = archivedItem.id;
    await db.item.update({
      where: { id: archivedItem.id },
      data: { archivedAt: new Date() },
    });
    await db.decision.create({
      data: {
        organizationId: orgAId,
        itemId: archivedItem.id,
        type: "COMPLETED",
        rationale: "Shipped, then archived.",
        createdById: authorId,
        roadmapStage: "NOW",
      },
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    });
    await db.profile.delete({ where: { id: authorId } });
  });

  it("only places an Item on the roadmap when its current decision set a roadmapStage", async () => {
    const board = await listRoadmapForOrganization(orgAId);
    const allIds = [...board.NOW, ...board.NEXT, ...board.LATER].map(
      (i) => i.id,
    );
    expect(allIds).not.toContain(noStageItemId);
  });

  it("groups Items into the stage their current decision set", async () => {
    const board = await listRoadmapForOrganization(orgAId);
    expect(board.NOW.map((i) => i.id)).toContain(nowItemId);
    expect(board.NEXT.map((i) => i.id)).toEqual(
      expect.arrayContaining([nextItemHighPriorityId, nextItemLowPriorityId]),
    );
    expect(board.LATER).toEqual([]);
  });

  it("sorts each stage by priority rank, highest first", async () => {
    const board = await listRoadmapForOrganization(orgAId);
    const nextIds = board.NEXT.map((i) => i.id);
    expect(nextIds.indexOf(nextItemHighPriorityId)).toBeLessThan(
      nextIds.indexOf(nextItemLowPriorityId),
    );
  });

  it("excludes archived Items even if their current decision set a roadmapStage", async () => {
    const board = await listRoadmapForOrganization(orgAId);
    const allIds = [...board.NOW, ...board.NEXT, ...board.LATER].map(
      (i) => i.id,
    );
    expect(allIds).not.toContain(archivedRoadmapItemId);
  });

  it("is scoped to one organisation — an empty org sees an empty roadmap", async () => {
    const board = await listRoadmapForOrganization(orgBId);
    expect(board).toEqual({ NOW: [], NEXT: [], LATER: [] });
  });
});
