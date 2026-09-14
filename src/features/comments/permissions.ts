import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

export function canCommentOnItem(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "MEMBER");
}

/** Only the author can edit their own comment — unlike Items, this isn't
 * also an admin moderation action (editing someone else's words reads
 * differently from removing them). */
export function canEditComment(isAuthor: boolean): boolean {
  return isAuthor;
}

/** The author can always delete their own comment; otherwise it's an
 * admin+ moderation action. */
export function canDeleteComment(
  role: MembershipRole,
  isAuthor: boolean,
): boolean {
  return isAuthor || hasAtLeastRole(role, "ADMIN");
}
