import "server-only";
import { db } from "@/server/db";
import { otherThan, sameName } from "@/lib/names";
import type { Category } from "@/generated/prisma/client";

export async function listCategoriesForOrganization(
  organizationId: string,
): Promise<Category[]> {
  return db.category.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

/** Whether a category in this organisation already has this name, ignoring case. Pass `excludeId`
 * when renaming or restoring so the row doesn't collide with itself. */
export async function isCategoryNameTaken(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.category.findFirst({
    where: {
      organizationId,
      name: sameName(name),
      ...otherThan(excludeId),
    },
    select: { id: true },
  });
  return existing !== null;
}
