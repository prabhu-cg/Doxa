// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import {
  computeItemScore,
  getScoresForItem,
  listScoreCriteriaForOrganization,
  type ItemScoreWithCriterion,
} from "./queries";
import { canManageScoreCriteria, canScoreItem } from "./permissions";

/**
 * Exercises the flexible, organisation-configured scoring model: tenant
 * isolation for ScoreCriterion (mirrors the Status/ItemType pattern in
 * features/items/items.integration.test.ts), the ItemScore
 * (itemId, criterionId) uniqueness guarantee (same upsert-a-row shape as
 * Vote — see features/votes/votes.integration.test.ts), and
 * computeItemScore's weighted-average logic. Server Action-level
 * permission checks (setItemScore/clearItemScore) need a live request
 * context and aren't exercised here — the pure permission matrix and the
 * weighted-average math are, since both are safely unit-testable.
 */
describe("ScoreCriterion tenant isolation", () => {
  let orgAId: string;
  let orgBId: string;

  beforeAll(async () => {
    const orgA = await db.organization.create({
      data: { name: "Org A", slug: `scoring-a-${randomUUID().slice(0, 8)}` },
    });
    orgAId = orgA.id;
    const orgB = await db.organization.create({
      data: { name: "Org B", slug: `scoring-b-${randomUUID().slice(0, 8)}` },
    });
    orgBId = orgB.id;

    await db.scoreCriterion.create({
      data: {
        organizationId: orgAId,
        name: "Customer impact",
        slug: "customer-impact",
        weight: 2,
      },
    });
    await db.scoreCriterion.create({
      data: {
        organizationId: orgBId,
        name: "Effort",
        slug: "effort",
        weight: 1,
      },
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    });
  });

  it("only returns criteria belonging to the given organisation", async () => {
    const orgACriteria = await listScoreCriteriaForOrganization(orgAId);
    expect(orgACriteria).toHaveLength(1);
    expect(orgACriteria[0]?.name).toBe("Customer impact");

    const orgBCriteria = await listScoreCriteriaForOrganization(orgBId);
    expect(orgBCriteria).toHaveLength(1);
    expect(orgBCriteria[0]?.name).toBe("Effort");
  });

  it("an organisation with zero configured criteria gets an empty list, not an error", async () => {
    const org = await db.organization.create({
      data: {
        name: "Empty Org",
        slug: `scoring-empty-${randomUUID().slice(0, 8)}`,
      },
    });
    expect(await listScoreCriteriaForOrganization(org.id)).toEqual([]);
    await db.organization.delete({ where: { id: org.id } });
  });
});

describe("ItemScore uniqueness and computeItemScore", () => {
  const authorId = randomUUID();
  let orgId: string;
  let itemId: string;
  let impactCriterionId: string;
  let effortCriterionId: string;

  beforeAll(async () => {
    await db.profile.create({ data: { id: authorId, displayName: "Author" } });
    const org = await db.organization.create({
      data: {
        name: "Score Test Org",
        slug: `score-test-${randomUUID().slice(0, 8)}`,
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

    const impact = await db.scoreCriterion.create({
      data: {
        organizationId: orgId,
        name: "Impact",
        slug: "impact",
        weight: 3,
      },
    });
    impactCriterionId = impact.id;
    const effort = await db.scoreCriterion.create({
      data: {
        organizationId: orgId,
        name: "Effort",
        slug: "effort",
        weight: 1,
      },
    });
    effortCriterionId = effort.id;
  });

  afterAll(async () => {
    await db.organization.delete({ where: { id: orgId } });
    await db.profile.delete({ where: { id: authorId } });
  });

  it("(itemId, criterionId) is unique — a second insert for the same pair fails", async () => {
    await db.itemScore.create({
      data: { itemId, criterionId: impactCriterionId, value: 4 },
    });

    await expect(
      db.itemScore.create({
        data: { itemId, criterionId: impactCriterionId, value: 2 },
      }),
    ).rejects.toThrow();

    await db.itemScore.deleteMany({ where: { itemId } });
  });

  it("an unscored item computes to null, not zero", async () => {
    expect(await getScoresForItem(itemId)).toEqual([]);
    expect(computeItemScore([])).toBeNull();
  });

  it("computeItemScore is a weighted average across only the criteria actually scored", async () => {
    await db.itemScore.create({
      data: { itemId, criterionId: impactCriterionId, value: 4 },
    });
    await db.itemScore.create({
      data: { itemId, criterionId: effortCriterionId, value: 2 },
    });

    const scores = await getScoresForItem(itemId);
    expect(scores).toHaveLength(2);

    const computed = computeItemScore(scores);
    // weighted average = (4*3 + 2*1) / (3+1) = 14/4 = 3.5
    expect(computed?.weightedAverage).toBeCloseTo(3.5);
    expect(computed?.scoredCount).toBe(2);

    await db.itemScore.deleteMany({ where: { itemId } });
  });

  it("scoring on only one of two configured criteria never forces the other", async () => {
    await db.itemScore.create({
      data: { itemId, criterionId: impactCriterionId, value: 5 },
    });

    const scores = await getScoresForItem(itemId);
    const computed = computeItemScore(scores);
    expect(computed?.weightedAverage).toBe(5);
    expect(computed?.scoredCount).toBe(1);

    await db.itemScore.deleteMany({ where: { itemId } });
  });

  it("a criterion with zero weight never divides by zero", () => {
    const zeroWeighted: ItemScoreWithCriterion[] = [
      {
        id: "x",
        itemId,
        criterionId: "c",
        value: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        criterion: {
          id: "c",
          organizationId: orgId,
          name: "Zero",
          slug: "zero",
          description: null,
          weight: 0,
          sortOrder: 0,
          archivedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ];
    expect(computeItemScore(zeroWeighted)).toBeNull();
  });
});

describe("Scoring permissions", () => {
  it("only owners and admins can manage scoring criteria", () => {
    expect(canManageScoreCriteria("MEMBER")).toBe(false);
    expect(canManageScoreCriteria("ADMIN")).toBe(true);
    expect(canManageScoreCriteria("OWNER")).toBe(true);
  });

  it("scoring an item (the business signal) is admin+-only, unlike voting", () => {
    expect(canScoreItem("MEMBER")).toBe(false);
    expect(canScoreItem("ADMIN")).toBe(true);
    expect(canScoreItem("OWNER")).toBe(true);
  });
});
