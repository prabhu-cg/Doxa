import "server-only";
import { db } from "@/server/db";
import { otherThan, sameName } from "@/lib/names";
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

/** Whether an active status in this organisation already has this name, ignoring case. Pass `excludeId`
 * when renaming or restoring so the row doesn't collide with itself. */
export async function isStatusNameTaken(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.status.findFirst({
    where: {
      organizationId,
      archivedAt: null,
      name: sameName(name),
      ...otherThan(excludeId),
    },
    select: { id: true },
  });
  return existing !== null;
}
