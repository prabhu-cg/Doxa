import "server-only";
import { db } from "@/server/db";
import type { Tag } from "@/generated/prisma/client";

export async function listTagsForOrganization(
  organizationId: string,
): Promise<Tag[]> {
  return db.tag.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}
