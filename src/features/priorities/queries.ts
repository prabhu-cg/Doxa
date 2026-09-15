import "server-only";
import { db } from "@/server/db";
import type { Priority } from "@/generated/prisma/client";

export async function listPrioritiesForOrganization(
  organizationId: string,
  options: { includeArchived?: boolean } = {},
): Promise<Priority[]> {
  return db.priority.findMany({
    where: {
      organizationId,
      ...(options.includeArchived ? {} : { archivedAt: null }),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

/** The priority a newly-created Item starts at: the org's `isDefault`
 * priority ("None"), falling back to the lowest-ranked active one if none
 * is marked default (e.g. it was archived). Never a hard-coded priority
 * name — mirrors getDefaultStatus. */
export async function getDefaultPriority(
  organizationId: string,
): Promise<Priority | null> {
  return db.priority.findFirst({
    where: { organizationId, archivedAt: null },
    orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}
