import "server-only";
import { db } from "@/server/db";
import type {
  Item,
  ItemType,
  Priority,
  Status,
} from "@/generated/prisma/client";
import { ROADMAP_STAGES } from "@/features/decisions/schema";
import type { DecisionWithAuthor } from "@/features/decisions/queries";

export type RoadmapItem = Item & {
  itemType: ItemType;
  status: Status;
  priority: Priority;
  board: { slug: string };
  currentDecision: DecisionWithAuthor;
  _count: { votes: number };
};

export type RoadmapBoard = Record<
  (typeof ROADMAP_STAGES)[number],
  RoadmapItem[]
>;

/**
 * A basic Now/Next/Later view, derived entirely from Item + Decision data
 * — not a new roadmap-specific model. An Item appears here only when its
 * CURRENT decision (the most recent Decision row) explicitly set a
 * `roadmapStage`; recording a Decision without one (or one whose stage is
 * DECLINED-and-unset) simply keeps that Item off the roadmap. See
 * "Roadmap" in docs/architecture.md and the Decision model's doc comment.
 */
export async function listRoadmapForOrganization(
  organizationId: string,
): Promise<RoadmapBoard> {
  const items = await db.item.findMany({
    where: { organizationId, deletedAt: null, archivedAt: null },
    include: {
      itemType: true,
      status: true,
      priority: true,
      board: { select: { slug: true } },
      decisions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { createdBy: true },
      },
      _count: { select: { votes: true } },
    },
  });

  const board: RoadmapBoard = { NOW: [], NEXT: [], LATER: [] };

  for (const { decisions, ...item } of items) {
    const currentDecision = decisions[0];
    if (!currentDecision?.roadmapStage) continue;
    board[currentDecision.roadmapStage].push({ ...item, currentDecision });
  }

  for (const stage of ROADMAP_STAGES) {
    board[stage].sort(
      (a, b) =>
        b.priority.sortOrder - a.priority.sortOrder ||
        b._count.votes - a._count.votes,
    );
  }

  return board;
}
