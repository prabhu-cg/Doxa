import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

export function canManageTags(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "ADMIN");
}
