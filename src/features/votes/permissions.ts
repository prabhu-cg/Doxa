import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

/** Any org member can vote — same bar as submitting an Item. Votes are
 * evidence of interest, not a privileged action. */
export function canVoteOnItem(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "MEMBER");
}
