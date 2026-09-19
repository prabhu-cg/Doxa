import "server-only";
import { db } from "@/server/db";
import type {
  Category,
  Item,
  ItemType,
  Priority,
  Status,
} from "@/generated/prisma/client";
import {
  computeItemScore,
  getScoresForItems,
} from "@/features/scoring/queries";
import type { PrioritizationSort } from "./schema";

export type PrioritizationItem = Item & {
  itemType: ItemType;
  status: Status;
  priority: Priority;
  category: Category | null;
  board: { slug: string };
  _count: { votes: number };
  score: number | null;
};

export type PrioritizationFilters = {
  itemTypeSlug?: string;
  statusSlug?: string;
  categorySlug?: string;
  sort?: PrioritizationSort;
};

/**
 * The "what should we consider next?" view: every non-archived Item
 * across the organisation's boards (deliberately not board-scoped, unlike
 * listItemsForBoard), each carrying its vote count (community signal) and
 * computed weighted score (business signal) side by side — never
 * combined into one ranking number, so the UI can show both without
 * implying either one is "the" priority. Sorting by `score` is done in
 * application code (a weighted average across dynamic, org-configured
 * criteria isn't a single sortable column), which is fine at the scale
 * this internal view is built for — see "Do not build a complex
 * project-management system" in docs/architecture.md.
 */
export async function listItemsForPrioritization(
  organizationId: string,
  filters: PrioritizationFilters = {},
): Promise<PrioritizationItem[]> {
  const items = await db.item.findMany({
    where: {
      organizationId,
      deletedAt: null,
      archivedAt: null,
      awaitingReview: false,
      ...(filters.itemTypeSlug
        ? { itemType: { slug: filters.itemTypeSlug } }
        : {}),
      ...(filters.statusSlug ? { status: { slug: filters.statusSlug } } : {}),
      ...(filters.categorySlug
        ? { category: { slug: filters.categorySlug } }
        : {}),
    },
    include: {
      itemType: true,
      status: true,
      priority: true,
      category: true,
      board: { select: { slug: true } },
      _count: { select: { votes: true } },
    },
  });

  const scoresByItem = await getScoresForItems(items.map((item) => item.id));

  const withScores: PrioritizationItem[] = items.map((item) => ({
    ...item,
    score:
      computeItemScore(scoresByItem.get(item.id) ?? [])?.weightedAverage ??
      null,
  }));

  const sort = filters.sort ?? "votes";
  withScores.sort((a, b) => {
    switch (sort) {
      case "priority":
        return b.priority.sortOrder - a.priority.sortOrder;
      case "status":
        return a.status.name.localeCompare(b.status.name);
      case "type":
        return a.itemType.name.localeCompare(b.itemType.name);
      case "category":
        return (a.category?.name ?? "").localeCompare(b.category?.name ?? "");
      case "score":
        return (b.score ?? -1) - (a.score ?? -1);
      case "votes":
      default:
        return b._count.votes - a._count.votes;
    }
  });

  return withScores;
}
