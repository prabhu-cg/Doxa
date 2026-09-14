import "server-only";
import { db } from "@/server/db";
import { slugify } from "@/lib/slug";

/**
 * Get-or-create tags by free-text name, scoped to one organisation. Used by
 * item creation/editing so authors can type tags without a separate "manage
 * tags first" step. Not a Server Action itself — called from within
 * features/items/actions.ts.
 */
export async function resolveOrCreateTagIds(
  organizationId: string,
  names: string[],
): Promise<string[]> {
  const ids = new Set<string>();

  for (const rawName of names) {
    const name = rawName.trim();
    if (!name) continue;
    const slug = slugify(name);

    const tag = await db.tag.upsert({
      where: { organizationId_slug: { organizationId, slug } },
      update: {},
      create: { organizationId, name, slug },
    });
    ids.add(tag.id);
  }

  return [...ids];
}
