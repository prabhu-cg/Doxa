import "server-only";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import {
  requireOrganizationMembership,
  type MembershipWithOrganization,
} from "@/features/organizations/queries";
import type { Profile, Space } from "@/generated/prisma/client";

export async function listSpacesForOrganization(
  organizationId: string,
  options: { includeArchived?: boolean } = {},
): Promise<(Space & { _count: { boards: number } })[]> {
  return db.space.findMany({
    where: {
      organizationId,
      ...(options.includeArchived ? {} : { archivedAt: null }),
    },
    include: { _count: { select: { boards: true } } },
    orderBy: { createdAt: "asc" },
  });
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
