import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

/** Any org member can vote — same bar as submitting an Item — and so can a
 * community participant (`role` null; the caller has already checked they may
 * take part on this board). Votes are evidence of interest, not a privileged
 * action. */
export function canVoteOnItem(role: MembershipRole | null): boolean {
  return role === null || hasAtLeastRole(role, "MEMBER");
}
