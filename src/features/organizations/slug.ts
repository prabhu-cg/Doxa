import "server-only";
import { db } from "@/server/db";
import { generateUniqueSlug, slugify } from "@/lib/slug";

export async function generateUniqueOrganizationSlug(
  name: string,
): Promise<string> {
  return generateUniqueSlug(slugify(name), async (candidate) => {
    const existing = await db.organization.findUnique({
      where: { slug: candidate },
    });
    return existing !== null;
  });
}
