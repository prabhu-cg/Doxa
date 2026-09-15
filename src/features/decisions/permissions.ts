import type { MembershipRole } from "@/generated/prisma/client";
import { hasAtLeastRole } from "@/features/organizations/permissions";

/** Recording a Decision is an org-level call on behalf of the
 * organisation, not something an Item's author or an arbitrary member
 * does — admin+-only, same tier as moderation. */
export function canRecordDecision(role: MembershipRole): boolean {
  return hasAtLeastRole(role, "ADMIN");
}
