import "server-only";
import { db } from "@/server/db";
import { generateUniqueSlug, slugify } from "@/lib/slug";

export async function generateUniqueCategorySlug(
  organizationId: string,
  name: string,
): Promise<string> {
  return generateUniqueSlug(slugify(name), async (candidate) => {
    const existing = await db.category.findUnique({
      where: { organizationId_slug: { organizationId, slug: candidate } },
    });
    return existing !== null;
  });
}
