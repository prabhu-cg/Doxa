import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

/** Any org member can submit an Item to a board they can see. */
export function canCreateItem(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "MEMBER");
}

/** The author can always edit/archive their own Item; otherwise it's an
 * owner/admin moderation action. */
export function canEditItem(role: MembershipRole, isAuthor: boolean): boolean {
  return isAuthor || hasAtLeastRole(role, "ADMIN");
}

export function canArchiveItem(
  role: MembershipRole,
  isAuthor: boolean,
): boolean {
  return isAuthor || hasAtLeastRole(role, "ADMIN");
}
