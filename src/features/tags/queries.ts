import "server-only";
import { db } from "@/server/db";
import { otherThan, sameName } from "@/lib/names";
import type { Tag } from "@/generated/prisma/client";

export async function listTagsForOrganization(
  organizationId: string,
): Promise<Tag[]> {
  return db.tag.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

/** Whether a tag in this organisation already has this name, ignoring case. Pass `excludeId`
 * when renaming or restoring so the row doesn't collide with itself. */
export async function isTagNameTaken(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.tag.findFirst({
    where: {
      organizationId,
      name: sameName(name),
      ...otherThan(excludeId),
    },
    select: { id: true },
  });
  return existing !== null;
}
