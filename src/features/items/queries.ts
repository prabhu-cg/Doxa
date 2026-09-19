import "server-only";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import {
  requireBoardForOrgMember,
  getVisibleBoard,
} from "@/features/boards/queries";
import type {
  Category,
  Item,
  ItemTag,
  ItemType,
  Organization,
  Priority,
  Prisma,
  Profile,
  Status,
  Tag,
} from "@/generated/prisma/client";
import type { BoardWithSpace } from "@/features/boards/queries";
import type { MembershipWithOrganization } from "@/features/organizations/queries";
import type { BoardSort } from "./schema";

export type ItemWithRelations = Item & {
  itemType: ItemType;
  status: Status;
  priority: Priority;
  category: Category | null;
  author: Profile;
  tags: (ItemTag & { tag: Tag })[];
  _count: { votes: number; comments: number };
};

export type BoardFilters = {
  q?: string;
  itemTypeSlug?: string;
  statusSlug?: string;
  categorySlug?: string;
  tagSlug?: string;
  origin?: "team" | "community";
  sort?: BoardSort;
};

const itemRelationsInclude = {
  itemType: true,
  status: true,
  priority: true,
  category: true,
  author: true,
  tags: { include: { tag: true } },
  _count: { select: { votes: true, comments: { where: { deletedAt: null } } } },
} as const;

const SORT_ORDER_BY: Record<BoardSort, Prisma.ItemOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "most-voted": { votes: { _count: "desc" } },
  "recently-updated": { updatedAt: "desc" },
};

/** `includePending` is for the team's own views: a community submission that
 * hasn't been approved yet is otherwise left out, so the public board never
 * lists it. */
export async function listItemsForBoard(
  boardId: string,
  filters: BoardFilters = {},
  options: { includeArchived?: boolean; includePending?: boolean } = {},
): Promise<ItemWithRelations[]> {
  return db.item.findMany({
    where: {
      boardId,
      deletedAt: null,
      ...(options.includeArchived ? {} : { archivedAt: null }),
      ...(options.includePending ? {} : { awaitingReview: false }),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { description: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.itemTypeSlug
        ? { itemType: { slug: filters.itemTypeSlug } }
        : {}),
      ...(filters.statusSlug ? { status: { slug: filters.statusSlug } } : {}),
      ...(filters.categorySlug
        ? { category: { slug: filters.categorySlug } }
        : {}),
      ...(filters.tagSlug
        ? { tags: { some: { tag: { slug: filters.tagSlug } } } }
        : {}),
      ...(filters.origin
        ? { origin: filters.origin === "team" ? "TEAM" : "COMMUNITY" }
        : {}),
    },
    include: itemRelationsInclude,
    orderBy: SORT_ORDER_BY[filters.sort ?? "newest"],
  });
}

/** For admin views — visible regardless of archive state (so an admin can
 * find and restore an archived Item), but never a soft-deleted one. */
export async function getItemForOrgMember(
  boardId: string,
  itemSlug: string,
): Promise<ItemWithRelations | null> {
  return db.item.findFirst({
    where: { boardId, slug: itemSlug, deletedAt: null },
    include: itemRelationsInclude,
  });
}

/** For the public routes — archived (and deleted) Items are invisible, and so
 * is a submission still awaiting review, except to the person who submitted it. */
export async function getItemForVisitor(
  boardId: string,
  itemSlug: string,
  viewerId?: string,
): Promise<ItemWithRelations | null> {
  return db.item.findFirst({
    where: {
      boardId,
      slug: itemSlug,
      deletedAt: null,
      archivedAt: null,
      OR: [
        { awaitingReview: false },
        ...(viewerId ? [{ authorId: viewerId }] : []),
      ],
    },
    include: itemRelationsInclude,
  });
}

export async function requireItemForOrgMember(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<{
  profile: Profile;
  membership: MembershipWithOrganization;
  board: BoardWithSpace;
  item: ItemWithRelations;
}> {
  const { profile, membership, board } = await requireBoardForOrgMember(
    orgSlug,
    boardSlug,
  );
  const item = await getItemForOrgMember(board.id, itemSlug);
  if (!item) notFound();
  return { profile, membership, board, item };
}

/** Same indistinguishable-null pattern as getVisibleBoard, one level
 * deeper: no such org/board/item, an archived board, a private board a
 * visitor can't see, or an archived/deleted Item are all just null. */
export async function getVisibleItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
  viewerId?: string,
): Promise<{
  organization: Organization;
  board: BoardWithSpace;
  item: ItemWithRelations;
} | null> {
  const visible = await getVisibleBoard(orgSlug, boardSlug);
  if (!visible) return null;

  const item = await getItemForVisitor(visible.board.id, itemSlug, viewerId);
  if (!item) return null;

  return { organization: visible.organization, board: visible.board, item };
}

/** What a board's public masthead says about it: how many items it lists and
 * how many votes are on them — over the same items the public list shows. */
export async function getBoardTotals(
  boardId: string,
): Promise<{ items: number; votes: number }> {
  const live = {
    boardId,
    deletedAt: null,
    archivedAt: null,
    awaitingReview: false,
  };
  const [items, votes] = await Promise.all([
    db.item.count({ where: live }),
    db.vote.count({ where: { item: live } }),
  ]);
  return { items, votes };
}
