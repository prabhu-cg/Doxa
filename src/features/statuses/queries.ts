import "server-only";
import { db } from "@/server/db";
import type { Status } from "@/generated/prisma/client";

export async function listStatusesForOrganization(
  organizationId: string,
  options: { includeArchived?: boolean } = {},
): Promise<Status[]> {
  return db.status.findMany({
    where: {
      organizationId,
      ...(options.includeArchived ? {} : { archivedAt: null }),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

/** The status a newly-created Item starts in: the org's `isDefault` status,
 * falling back to the first active one by sort order if none is marked
 * default (e.g. it was archived). Never a hard-coded status name. */
export async function getDefaultStatus(
  organizationId: string,
): Promise<Status | null> {
  return db.status.findFirst({
    where: { organizationId, archivedAt: null },
    orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}
