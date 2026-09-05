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
