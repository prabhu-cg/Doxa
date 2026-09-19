import "server-only";
import { db } from "@/server/db";
import { otherThan, sameName } from "@/lib/names";
import type { ItemScore, ScoreCriterion } from "@/generated/prisma/client";

export type ItemScoreWithCriterion = ItemScore & { criterion: ScoreCriterion };

export async function listScoreCriteriaForOrganization(
  organizationId: string,
  options: { includeArchived?: boolean } = {},
): Promise<ScoreCriterion[]> {
  return db.scoreCriterion.findMany({
    where: {
      organizationId,
      ...(options.includeArchived ? {} : { archivedAt: null }),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getScoresForItem(
  itemId: string,
): Promise<ItemScoreWithCriterion[]> {
  return db.itemScore.findMany({
    where: { itemId },
    include: { criterion: true },
    orderBy: { criterion: { sortOrder: "asc" } },
  });
}

/** Every ItemScore for a set of Items in one query, grouped by itemId —
 * for list views (e.g. the admin prioritisation view) that would
 * otherwise run one query per Item. */
export async function getScoresForItems(
  itemIds: string[],
): Promise<Map<string, ItemScoreWithCriterion[]>> {
  if (itemIds.length === 0) return new Map();

  const scores = await db.itemScore.findMany({
    where: { itemId: { in: itemIds } },
    include: { criterion: true },
  });

  const byItem = new Map<string, ItemScoreWithCriterion[]>();
  for (const score of scores) {
    const existing = byItem.get(score.itemId);
    if (existing) existing.push(score);
    else byItem.set(score.itemId, [score]);
  }
  return byItem;
}

export type ComputedScore = { weightedAverage: number; scoredCount: number };

/** A weighted average (1-5) across whatever criteria an Item has actually
 * been scored on — never all of an organisation's configured criteria,
 * since scoring every dimension is never required. Returns null for an
 * unscored Item (or one whose scored criteria are all zero-weight)
 * instead of a misleading 0. */
export function computeItemScore(
  scores: ItemScoreWithCriterion[],
): ComputedScore | null {
  if (scores.length === 0) return null;

  const totalWeight = scores.reduce((sum, s) => sum + s.criterion.weight, 0);
  if (totalWeight <= 0) return null;

  const weightedSum = scores.reduce(
    (sum, s) => sum + s.value * s.criterion.weight,
    0,
  );

  return {
    weightedAverage: weightedSum / totalWeight,
    scoredCount: scores.length,
  };
}

/** Whether an active scoring criterion in this organisation already has this name, ignoring case. Pass `excludeId`
 * when renaming or restoring so the row doesn't collide with itself. */
export async function isScoreCriterionNameTaken(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.scoreCriterion.findFirst({
    where: {
      organizationId,
      archivedAt: null,
      name: sameName(name),
      ...otherThan(excludeId),
    },
    select: { id: true },
  });
  return existing !== null;
}
