import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import type { Decision } from "@/generated/prisma/client";
import {
  summariseResponsiveness,
  type ResponseSummary,
} from "@/lib/decision-stats";

/**
 * What a decision shows on a public page: the call and the reasons behind it.
 * Deliberately no `internalNotes` and no author — the fields are chosen at the
 * query, so private data is never even loaded for a public page.
 */
export type PublicDecision = Pick<
  Decision,
  "id" | "type" | "rationale" | "targetDate" | "roadmapStage" | "createdAt"
>;

/** Every decision on an item, newest first — the whole history, so people can
 * see how a call changed and why. Memoised per request: an item drawer's header
 * and body both ask. */
export const listPublicDecisionsForItem = cache(
  async function listPublicDecisionsForItem(
    itemId: string,
  ): Promise<PublicDecision[]> {
    return db.decision.findMany({
      where: { itemId },
      select: {
        id: true,
        type: true,
        rationale: true,
        targetDate: true,
        roadmapStage: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
);

/** Each item's current decision type, for badges on a list of cards. Items
 * with no decision are simply absent from the map. */
export async function getCurrentDecisionTypesForItems(
  itemIds: string[],
): Promise<Map<string, Decision["type"]>> {
  if (itemIds.length === 0) return new Map();
  const decisions = await db.decision.findMany({
    where: { itemId: { in: itemIds } },
    select: { itemId: true, type: true },
    orderBy: { createdAt: "desc" },
  });
  const current = new Map<string, Decision["type"]>();
  for (const { itemId, type } of decisions) {
    if (!current.has(itemId)) current.set(itemId, type);
  }
  return current;
}

/** How many of a board's live items have been decided, and how quickly — over
 * the same items its public page lists (not archived, not deleted). */
export async function getResponseSummaryForBoard(
  boardId: string,
): Promise<ResponseSummary> {
  const items = await db.item.findMany({
    where: {
      boardId,
      deletedAt: null,
      archivedAt: null,
      awaitingReview: false,
    },
    select: {
      createdAt: true,
      decisions: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });
  return summariseResponsiveness(
    items.map((item) => ({
      createdAt: item.createdAt,
      firstDecisionAt: item.decisions[0]?.createdAt ?? null,
    })),
  );
}
