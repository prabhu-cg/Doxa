import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

/** Approving or declining a community submission, and blocking or unblocking
 * a participant — the same admin+ bar as deleting someone else's comment. */
export function canModerateCommunity(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "ADMIN");
}
