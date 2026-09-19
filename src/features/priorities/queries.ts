import "server-only";
import { db } from "@/server/db";
import { otherThan, sameName } from "@/lib/names";
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

/** Whether an active priority in this organisation already has this name, ignoring case. Pass `excludeId`
 * when renaming or restoring so the row doesn't collide with itself. */
export async function isPriorityNameTaken(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.priority.findFirst({
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
