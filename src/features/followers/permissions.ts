import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

/** Members and community participants (`role` null) alike. */
export function canFollowItem(role: MembershipRole | null): boolean {
  return role === null || hasAtLeastRole(role, "MEMBER");
}
