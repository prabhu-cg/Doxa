import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

export function canFollowItem(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "MEMBER");
}
