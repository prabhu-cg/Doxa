import "server-only";
import { db } from "@/server/db";
import { otherThan, sameName } from "@/lib/names";
import type { ItemType } from "@/generated/prisma/client";

export async function listItemTypesForOrganization(
  organizationId: string,
  options: { includeArchived?: boolean } = {},
): Promise<ItemType[]> {
  return db.itemType.findMany({
    where: {
      organizationId,
      ...(options.includeArchived ? {} : { archivedAt: null }),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

/** Whether an active item type in this organisation already has this name, ignoring case. Pass `excludeId`
 * when renaming or restoring so the row doesn't collide with itself. */
export async function isItemTypeNameTaken(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.itemType.findFirst({
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
