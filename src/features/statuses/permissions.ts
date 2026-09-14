import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

export function canManageStatuses(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "ADMIN");
}
