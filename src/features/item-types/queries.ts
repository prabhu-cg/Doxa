import "server-only";
import { db } from "@/server/db";
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
