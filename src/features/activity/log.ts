import "server-only";
import type { ActivityType, Prisma } from "@/generated/prisma/client";
import type { DbOrTx } from "@/server/db";

/**
 * Builds (does not await) an ItemActivity insert. Not a Server Action —
 * called from within other features' actions, either standalone (pass
 * `db`) or as one write inside an interactive transaction (pass `tx`), so
 * the activity entry can never exist without the mutation it records, or
 * vice versa.
 */
export function logActivity(
  client: DbOrTx,
  params: {
    itemId: string;
    actorId: string | null;
    type: ActivityType;
    data?: Prisma.InputJsonValue;
  },
) {
  return client.itemActivity.create({
    data: {
      itemId: params.itemId,
      actorId: params.actorId,
      type: params.type,
      data: params.data ?? {},
    },
  });
}
