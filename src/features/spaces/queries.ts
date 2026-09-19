import "server-only";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { otherThan, sameName } from "@/lib/names";
import {
  requireOrganizationMembership,
  type MembershipWithOrganization,
} from "@/features/organizations/queries";
import type { Profile, Space } from "@/generated/prisma/client";

export type SpaceWithCounts = Space & {
  _count: { boards: number; items: number };
  /** The later of the space's own edit and its most recently touched item. */
  lastActivityAt: Date;
};

/** Oldest first by default: the "New board" form pre-selects the first space.
 * Pass `newestFirst` for a grid where the latest addition should lead. */
export async function listSpacesForOrganization(
  organizationId: string,
  options: { includeArchived?: boolean; newestFirst?: boolean } = {},
): Promise<SpaceWithCounts[]> {
  const liveItems = { deletedAt: null, archivedAt: null };
  const spaces = await db.space.findMany({
    where: {
      organizationId,
      ...(options.includeArchived ? {} : { archivedAt: null }),
    },
    include: {
      _count: { select: { boards: true, items: { where: liveItems } } },
      items: {
        where: { deletedAt: null },
        select: { updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: options.newestFirst
      ? [{ createdAt: "desc" as const }, { id: "desc" as const }]
      : [{ createdAt: "asc" as const }],
  });
  return spaces.map(({ items, ...space }) => ({
    ...space,
    lastActivityAt:
      items[0] && items[0].updatedAt > space.updatedAt
        ? items[0].updatedAt
        : space.updatedAt,
  }));
}

/** Returns null for both "no such space" and "space belongs to a different
 * organisation" — the same indistinguishable-404 pattern as
 * getMembershipForSlug. See docs/multi-tenancy.md. */
export async function getSpaceBySlug(
  organizationId: string,
  spaceSlug: string,
): Promise<Space | null> {
  return db.space.findUnique({
    where: { organizationId_slug: { organizationId, slug: spaceSlug } },
  });
}

export async function requireSpaceForOrgMember(
  orgSlug: string,
  spaceSlug: string,
): Promise<{
  profile: Profile;
  membership: MembershipWithOrganization;
  space: Space;
}> {
  const { profile, membership } = await requireOrganizationMembership(orgSlug);
  const space = await getSpaceBySlug(membership.organization.id, spaceSlug);
  if (!space) notFound();
  return { profile, membership, space };
}

/** Whether an active space in this organisation already has this name, ignoring case. Pass `excludeId`
 * when renaming or restoring so the row doesn't collide with itself. */
export async function isSpaceNameTaken(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.space.findFirst({
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
