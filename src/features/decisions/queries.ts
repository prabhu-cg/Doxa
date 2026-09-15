import "server-only";
import { db } from "@/server/db";
import type { Decision, Profile } from "@/generated/prisma/client";

export type DecisionWithAuthor = Decision & { createdBy: Profile };

/** Full, append-only decision HISTORY for one Item, most recent first —
 * see the Decision model's doc comment in prisma/schema.prisma. Never
 * filtered or paginated away; the whole point is nothing is hidden. */
export async function listDecisionsForItem(
  itemId: string,
): Promise<DecisionWithAuthor[]> {
  return db.decision.findMany({
    where: { itemId },
    include: { createdBy: true },
    orderBy: { createdAt: "desc" },
  });
}

/** The CURRENT decision for one Item — simply the most recent Decision
 * row, never a separately-tracked "current" pointer (see the schema
 * comment: recording a new Decision is the only way this changes). */
export async function getCurrentDecisionForItem(
  itemId: string,
): Promise<DecisionWithAuthor | null> {
  return db.decision.findFirst({
    where: { itemId },
    include: { createdBy: true },
    orderBy: { createdAt: "desc" },
  });
}

/** The current decision for a set of Items in one query — for list views
 * that would otherwise run one query per Item. Relies on Postgres
 * `DISTINCT ON` semantics via a raw grouping: fetch every Decision for
 * these Items ordered newest-first, then keep only the first one seen per
 * itemId in application code (Decision tables stay small per Item, so
 * this is cheap in practice). */
export async function getCurrentDecisionsForItems(
  itemIds: string[],
): Promise<Map<string, DecisionWithAuthor>> {
  if (itemIds.length === 0) return new Map();

  const decisions = await db.decision.findMany({
    where: { itemId: { in: itemIds } },
    include: { createdBy: true },
    orderBy: { createdAt: "desc" },
  });

  const current = new Map<string, DecisionWithAuthor>();
  for (const decision of decisions) {
    if (!current.has(decision.itemId)) current.set(decision.itemId, decision);
  }
  return current;
}
