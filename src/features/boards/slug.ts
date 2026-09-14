import "server-only";
import { db } from "@/server/db";
import { generateUniqueSlug, slugify } from "@/lib/slug";

export async function generateUniqueBoardSlug(
  organizationId: string,
  name: string,
): Promise<string> {
  return generateUniqueSlug(slugify(name), async (candidate) => {
    const existing = await db.board.findUnique({
      where: { organizationId_slug: { organizationId, slug: candidate } },
    });
    return existing !== null;
  });
}
