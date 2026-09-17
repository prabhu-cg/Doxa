import type { MembershipRole } from "@/generated/prisma/client";

/**
 * Capability matrix, kept separate from scattered `role === 'ADMIN'`
 * checks throughout the codebase. Adding a role later means updating the
 * `MembershipRole` enum (prisma/schema.prisma) and the matrix below —
 * callers never need to change.
 *
 * No "server-only" guard here deliberately — this is pure role
 * comparison, no secrets or DB access, and unlike server-only code it's
 * directly unit-testable without a Next.js request context.
 */
const ROLE_RANK: Record<MembershipRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function hasAtLeastRole(
  role: MembershipRole,
  minimum: MembershipRole,
): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function canUpdateOrganization(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "ADMIN");
}

export function canDeleteOrganization(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "OWNER");
}

/** A sole owner can't leave — someone has to hold that role. */
export function canLeaveOrganization(
  role: MembershipRole,
  ownerCount: number,
): boolean {
  if (role !== "OWNER") return true;
  return ownerCount > 1;
}

/** Basic moderation capability: admins+ can remove members (see
 * canRemoveMember for the per-target rule). */
export function canManageMembers(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "ADMIN");
}

/** An admin can remove a member or another admin, but never an owner —
 * only an owner can remove another owner, and never the last one (same
 * "someone has to hold that role" rule as canLeaveOrganization). Removing
 * yourself isn't covered here — that's "Leave organisation" instead. */
export function canRemoveMember(
  actorRole: MembershipRole,
  targetRole: MembershipRole,
  ownerCount: number,
): boolean {
  if (!hasAtLeastRole(actorRole, "ADMIN")) return false;
  if (targetRole === "OWNER") return actorRole === "OWNER" && ownerCount > 1;
  return true;
}

/** Same shape as canRemoveMember: an admin can move a member between
 * MEMBER and ADMIN but never touch an OWNER (promote to it or demote
 * from it); only an owner can do either, and never demote the last
 * owner. Changing your own role isn't covered here — there's no flow for
 * that, matching "Leave organisation" being the only self-targeting
 * action. */
export function canChangeMemberRole(
  actorRole: MembershipRole,
  targetRole: MembershipRole,
  newRole: MembershipRole,
  ownerCount: number,
): boolean {
  if (!hasAtLeastRole(actorRole, "ADMIN")) return false;
  if (targetRole === "OWNER" || newRole === "OWNER") {
    if (actorRole !== "OWNER") return false;
    if (targetRole === "OWNER" && newRole !== "OWNER" && ownerCount <= 1) {
      return false;
    }
  }
  return true;
}
