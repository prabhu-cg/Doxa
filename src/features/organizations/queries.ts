import "server-only";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { requireCurrentProfile } from "@/features/profile/queries";
import type {
  Membership,
  Organization,
  Profile,
} from "@/generated/prisma/client";

export type MembershipWithOrganization = Membership & {
  organization: Organization;
};

export async function listMembershipsForUser(
  userId: string,
): Promise<MembershipWithOrganization[]> {
  return db.membership.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Returns null both when the organisation doesn't exist AND when it
 * exists but the user isn't a member — deliberately indistinguishable, so
 * a caller can never tell those two cases apart from the response and
 * enumerate valid slugs they don't have access to.
 */
export async function getMembershipForSlug(
  slug: string,
  userId: string,
): Promise<MembershipWithOrganization | null> {
  const organization = await db.organization.findUnique({ where: { slug } });
  if (!organization) return null;

  const membership = await db.membership.findUnique({
    where: {
      organizationId_userId: { organizationId: organization.id, userId },
    },
  });
  if (!membership) return null;

  return { ...membership, organization };
}

/**
 * The page-level guard for every `/org/[slug]/**` route. Renders a plain
 * 404 for both "doesn't exist" and "not a member" — see
 * getMembershipForSlug and docs/multi-tenancy.md.
 */
export async function requireOrganizationMembership(
  slug: string,
): Promise<{ profile: Profile; membership: MembershipWithOrganization }> {
  const profile = await requireCurrentProfile();
  const membership = await getMembershipForSlug(slug, profile.id);
  if (!membership) notFound();
  return { profile, membership };
}

export async function countOwners(organizationId: string): Promise<number> {
  return db.membership.count({ where: { organizationId, role: "OWNER" } });
}

export async function listMembersForOrganization(organizationId: string) {
  return db.membership.findMany({
    where: { organizationId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}
