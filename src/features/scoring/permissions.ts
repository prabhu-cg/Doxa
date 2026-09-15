import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

/** Configuring which dimensions exist is org-config, same tier as
 * managing statuses/priorities. */
export function canManageScoreCriteria(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "ADMIN");
}

/** Scoring an Item is the BUSINESS SIGNAL half of its evidence (see
 * docs/architecture.md) — deliberately admin+-only, unlike voting (any
 * member), so a vote can never be mistaken for a business-value score. */
export function canScoreItem(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "ADMIN");
}
