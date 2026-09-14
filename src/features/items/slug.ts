import "server-only";
import { db } from "@/server/db";
import { generateUniqueSlug, slugify } from "@/lib/slug";

/** Scoped per-board, not per-organisation — item URLs are already
 * board-scoped (`/b/[org]/[board]/[item]`), and it keeps titles like
 * "Bug" from needing a random suffix on every other board. */
export async function generateUniqueItemSlug(
  boardId: string,
  title: string,
): Promise<string> {
  return generateUniqueSlug(slugify(title), async (candidate) => {
    const existing = await db.item.findUnique({
      where: { boardId_slug: { boardId, slug: candidate } },
    });
    return existing !== null;
  });
}
