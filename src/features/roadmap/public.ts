import "server-only";
import { db } from "@/server/db";
import type { Organization } from "@/generated/prisma/client";
import { ROADMAP_STAGES } from "@/features/decisions/schema";

export type PublicRoadmapItem = {
  id: string;
  title: string;
  slug: string;
  boardSlug: string;
  itemTypeName: string;
  rationale: string;
  targetDate: Date | null;
  votes: number;
  decidedAt: Date;
};

export type PublicRoadmap = {
  organization: Organization;
  boards: { slug: string; name: string }[];
  stages: Record<(typeof ROADMAP_STAGES)[number], PublicRoadmapItem[]>;
  /** Recently completed items, newest first. */
  shipped: PublicRoadmapItem[];
};

const SHIPPED_LIMIT = 10;

/**
 * What an organisation is happy to show the world: Now / Next / Later plus
 * what recently shipped, built only from items on Public, active boards — an
 * item on a Private board never appears here, however it was decided. Returns
 * null (a 404, like the public board pages) when the organisation doesn't
 * exist or has no public board at all.
 *
 * An item is placed by its CURRENT decision: a completed one is "shipped",
 * a declined or duplicate one is left off (a public roadmap must never imply
 * we'll build what we said no to), anything else with a roadmap stage goes
 * in that stage.
 */
export async function getPublicRoadmap(
  orgSlug: string,
): Promise<PublicRoadmap | null> {
  const organization = await db.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!organization) return null;

  const boards = await db.board.findMany({
    where: {
      organizationId: organization.id,
      visibility: "PUBLIC",
      status: "ACTIVE",
    },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });
  if (boards.length === 0) return null;

  const items = await db.item.findMany({
    where: {
      organizationId: organization.id,
      deletedAt: null,
      archivedAt: null,
      awaitingReview: false,
      board: { visibility: "PUBLIC", status: "ACTIVE" },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      board: { select: { slug: true } },
      itemType: { select: { name: true } },
      priority: { select: { sortOrder: true } },
      _count: { select: { votes: true } },
      decisions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          type: true,
          rationale: true,
          targetDate: true,
          roadmapStage: true,
          createdAt: true,
        },
      },
    },
  });

  const stages: PublicRoadmap["stages"] = { NOW: [], NEXT: [], LATER: [] };
  const priorityOrder = new Map<string, number>();
  const shipped: PublicRoadmapItem[] = [];

  for (const item of items) {
    const decision = item.decisions[0];
    if (!decision) continue;
    if (decision.type === "DECLINED" || decision.type === "DUPLICATE") continue;

    const entry: PublicRoadmapItem = {
      id: item.id,
      title: item.title,
      slug: item.slug,
      boardSlug: item.board.slug,
      itemTypeName: item.itemType.name,
      rationale: decision.rationale,
      targetDate: decision.targetDate,
      votes: item._count.votes,
      decidedAt: decision.createdAt,
    };
    priorityOrder.set(item.id, item.priority.sortOrder);

    if (decision.type === "COMPLETED") shipped.push(entry);
    else if (decision.roadmapStage) stages[decision.roadmapStage].push(entry);
  }

  for (const stage of ROADMAP_STAGES) {
    stages[stage].sort(
      (a, b) =>
        (priorityOrder.get(b.id) ?? 0) - (priorityOrder.get(a.id) ?? 0) ||
        b.votes - a.votes,
    );
  }
  shipped.sort((a, b) => b.decidedAt.getTime() - a.decidedAt.getTime());

  return {
    organization,
    boards,
    stages,
    shipped: shipped.slice(0, SHIPPED_LIMIT),
  };
}

/** Whether an organisation has any Public, active board — i.e. whether it has
 * a public roadmap to link to. */
export async function hasPublicBoard(organizationId: string): Promise<boolean> {
  const count = await db.board.count({
    where: { organizationId, visibility: "PUBLIC", status: "ACTIVE" },
  });
  return count > 0;
}
