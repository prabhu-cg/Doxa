// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import {
  getCurrentDecisionForItem,
  getCurrentDecisionsForItems,
  listDecisionsForItem,
} from "./queries";
import { canRecordDecision } from "./permissions";

/**
 * Exercises the append-only Decision model: history is never overwritten,
 * the "current" decision is always simply the most recent row, and
 * getCurrentDecisionsForItems batches correctly across Items. Direct
 * Prisma writes (bypassing the recordDecision Server Action, which needs
 * a live request context — same reasoning as
 * features/items/items.integration.test.ts) since there is deliberately
 * no updateDecision to test against: recording a decision only ever
 * inserts.
 */
describe("Decision history is append-only", () => {
  const authorId = randomUUID();
  let orgId: string;
  let itemId: string;
  let otherItemId: string;

  beforeAll(async () => {
    await db.profile.create({ data: { id: authorId, displayName: "Admin" } });
    const org = await db.organization.create({
      data: {
        name: "Decision Test Org",
        slug: `decision-test-${randomUUID().slice(0, 8)}`,
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

    const otherItem = await db.item.create({
      data: {
        organizationId: orgId,
        spaceId: space.id,
        boardId: board.id,
        itemTypeId: itemType.id,
        statusId: status.id,
        priorityId: priority.id,
        authorId,
        title: "Undecided item",
        slug: "undecided-item",
      },
    });
    otherItemId = otherItem.id;
  });

  afterAll(async () => {
    await db.organization.delete({ where: { id: orgId } });
    await db.profile.delete({ where: { id: authorId } });
  });

  it("an Item with no decisions has no current decision and empty history", async () => {
    expect(await getCurrentDecisionForItem(otherItemId)).toBeNull();
    expect(await listDecisionsForItem(otherItemId)).toEqual([]);
  });

  it("recording a decision makes it the current one", async () => {
    await db.decision.create({
      data: {
        organizationId: orgId,
        itemId,
        type: "PLANNED",
        rationale: "Enough demand and it fits the current roadmap.",
        createdById: authorId,
        roadmapStage: "NEXT",
      },
    });

    const current = await getCurrentDecisionForItem(itemId);
    expect(current?.type).toBe("PLANNED");
    expect(current?.roadmapStage).toBe("NEXT");
  });

  it("recording a second decision never overwrites the first — both remain in history, newest first", async () => {
    // Ensure a distinct createdAt ordering even under fast test execution.
    await new Promise((resolve) => setTimeout(resolve, 5));

    await db.decision.create({
      data: {
        organizationId: orgId,
        itemId,
        type: "IN_PROGRESS",
        rationale: "Work has started; moving from Planned to In Progress.",
        createdById: authorId,
      },
    });

    const history = await listDecisionsForItem(itemId);
    expect(history).toHaveLength(2);
    expect(history[0]?.type).toBe("IN_PROGRESS");
    expect(history[1]?.type).toBe("PLANNED");

    const current = await getCurrentDecisionForItem(itemId);
    expect(current?.type).toBe("IN_PROGRESS");
  });

  it("getCurrentDecisionsForItems returns only the newest decision per item", async () => {
    const map = await getCurrentDecisionsForItems([itemId, otherItemId]);
    expect(map.get(itemId)?.type).toBe("IN_PROGRESS");
    expect(map.has(otherItemId)).toBe(false);
  });

  it("getCurrentDecisionsForItems returns an empty map for an empty input", async () => {
    expect((await getCurrentDecisionsForItems([])).size).toBe(0);
  });
});

describe("Decision permissions", () => {
  it("recording a decision is admin+-only", () => {
    expect(canRecordDecision("MEMBER")).toBe(false);
    expect(canRecordDecision("ADMIN")).toBe(true);
    expect(canRecordDecision("OWNER")).toBe(true);
  });
});
