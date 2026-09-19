import "server-only";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { otherThan, sameName } from "@/lib/names";
import { getAuthenticatedSupabaseUser } from "@/features/auth/queries";
import {
  requireOrganizationMembership,
  type MembershipWithOrganization,
} from "@/features/organizations/queries";
import type {
  Board,
  Organization,
  Profile,
  Space,
} from "@/generated/prisma/client";

export type BoardWithSpace = Board & { space: Space };

export type BoardSummary = Board & {
  _count: { items: number };
  /** The later of the board's own edit and its most recently touched item. */
  lastActivityAt: Date;
};
export type BoardSummaryWithSpace = BoardSummary & { space: Space };

// Live items only, plus the newest one so a card can say when the board last
// moved — a board's own `updatedAt` doesn't change when items are added.
const boardSummaryInclude = {
  _count: {
    select: { items: { where: { deletedAt: null, archivedAt: null } } },
  },
  items: {
    where: { deletedAt: null },
    select: { updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 1,
  },
} as const;

function withLastActivity<
  T extends { updatedAt: Date; items: { updatedAt: Date }[] },
>({ items, ...board }: T): Omit<T, "items"> & { lastActivityAt: Date } {
  return {
    ...board,
    lastActivityAt:
      items[0] && items[0].updatedAt > board.updatedAt
        ? items[0].updatedAt
        : board.updatedAt,
  };
}

export async function listBoardsForOrganization(
  organizationId: string,
  options: { includeArchived?: boolean } = {},
): Promise<BoardSummaryWithSpace[]> {
  const boards = await db.board.findMany({
    where: {
      organizationId,
      ...(options.includeArchived ? {} : { status: "ACTIVE" }),
    },
    include: { space: true, ...boardSummaryInclude },
    orderBy: { createdAt: "asc" },
  });
  return boards.map(withLastActivity);
}

export async function listBoardsForSpace(
  spaceId: string,
  options: { includeArchived?: boolean } = {},
): Promise<BoardSummary[]> {
  const boards = await db.board.findMany({
    where: {
      spaceId,
      ...(options.includeArchived ? {} : { status: "ACTIVE" }),
    },
    include: boardSummaryInclude,
    orderBy: { createdAt: "asc" },
  });
  return boards.map(withLastActivity);
}

/** Returns null for both "no such board" and "board belongs to a different
 * organisation" — see docs/multi-tenancy.md. */
export async function getBoardBySlug(
  organizationId: string,
  boardSlug: string,
): Promise<BoardWithSpace | null> {
  return db.board.findUnique({
    where: { organizationId_slug: { organizationId, slug: boardSlug } },
    include: { space: true },
  });
}

export async function requireBoardForOrgMember(
  orgSlug: string,
  boardSlug: string,
): Promise<{
  profile: Profile;
  membership: MembershipWithOrganization;
  board: BoardWithSpace;
}> {
  const { profile, membership } = await requireOrganizationMembership(orgSlug);
  const board = await getBoardBySlug(membership.organization.id, boardSlug);
  if (!board) notFound();
  return { profile, membership, board };
}

/**
 * The tenant/visibility guard for the public `/b/[orgSlug]/[boardSlug]`
 * routes. Returns null — never a redirect — for every case that isn't "a
 * visible board": no such organisation, no such board, an archived board,
 * or a PRIVATE board viewed by a signed-out visitor or a non-member.
 * Deliberately the same shape for all of these so a visitor can't
 * distinguish "doesn't exist" from "exists but you can't see it" — the
 * public-route version of the multi-tenancy IDOR rule.
 */
export async function getVisibleBoard(
  orgSlug: string,
  boardSlug: string,
): Promise<{ organization: Organization; board: BoardWithSpace } | null> {
  const organization = await db.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!organization) return null;

  const board = await getBoardBySlug(organization.id, boardSlug);
  if (!board || board.status === "ARCHIVED") return null;

  if (board.visibility === "PRIVATE") {
    const user = await getAuthenticatedSupabaseUser();
    if (!user) return null;
    const membership = await db.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
    });
    if (!membership) return null;
  }

  return { organization, board };
}

/** Whether an active board in this space already has this name, ignoring case. Pass `excludeId`
 * when renaming or restoring so the row doesn't collide with itself. */
export async function isBoardNameTaken(
  spaceId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.board.findFirst({
    where: {
      spaceId,
      status: "ACTIVE",
      name: sameName(name),
      ...otherThan(excludeId),
    },
    select: { id: true },
  });
  return existing !== null;
}
