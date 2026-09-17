import "server-only";
import type { AuditLogAction, Prisma } from "@/generated/prisma/client";
import type { DbOrTx } from "@/server/db";

/**
 * Builds (does not await) an AuditLog insert — same call shape as
 * features/activity/log.ts#logActivity, so it can be dropped into an
 * existing `$transaction` array alongside the mutation it records,
 * meaning an audit entry can never exist without (or separately from)
 * the write it describes.
 *
 * `data` must never carry a secret, token, or credential — see
 * docs/security-principles.md's "Auditability" section, which named this
 * function explicitly. Pass only descriptive, non-sensitive context
 * (e.g. `{ fromRole, toRole }`, `{ field: "name" }`).
 */
export function logAuditEvent(
  client: DbOrTx,
  params: {
    organizationId: string;
    actorId: string | null;
    action: AuditLogAction;
    targetType?: string;
    targetId?: string;
    data?: Prisma.InputJsonValue;
  },
) {
  return client.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      data: params.data ?? {},
    },
  });
}
