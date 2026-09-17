import "server-only";
import { db } from "@/server/db";
import type { AuditLog, Profile } from "@/generated/prisma/client";

export type AuditLogWithActor = AuditLog & { actor: Profile | null };

/** Full, append-only audit history for one organisation, most recent
 * first — never filtered or paginated away by default, matching
 * decisions/queries.ts#listDecisionsForItem's "nothing is hidden"
 * rationale, since this is the record a security review would need. */
export async function listAuditLogForOrganization(
  organizationId: string,
  options: { limit?: number } = {},
): Promise<AuditLogWithActor[]> {
  return db.auditLog.findMany({
    where: { organizationId },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: options.limit,
  });
}
