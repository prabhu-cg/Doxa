import "server-only";
import { db } from "@/server/db";
import type { Category } from "@/generated/prisma/client";

export async function listCategoriesForOrganization(
  organizationId: string,
): Promise<Category[]> {
  return db.category.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}
