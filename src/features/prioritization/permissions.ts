import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

/** "What should we consider next?" is an internal, product/admin-facing
 * question — the view exists precisely because raw vote counts aren't a
 * decision, so it stays behind the same tier as moderation. */
export function canViewPrioritization(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "ADMIN");
}
