import type { MembershipRole } from "@/generated/prisma/client";

/** Only the owner controls money — an admin can manage members/boards/
 * content but not change what the organisation is billed for. */
export function canManageBilling(role: MembershipRole): boolean {
  return role === "OWNER";
}
