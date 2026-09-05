import "server-only";
import { db } from "@/server/db";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.length > 0 ? base.slice(0, 48) : "org";
}

/** Appends a short random suffix on collision rather than failing the request. */
export async function generateUniqueOrganizationSlug(
  name: string,
): Promise<string> {
  const base = slugify(name);

  const existing = await db.organization.findUnique({ where: { slug: base } });
  if (!existing) return base;

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    const collision = await db.organization.findUnique({
      where: { slug: candidate },
    });
    if (!collision) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
