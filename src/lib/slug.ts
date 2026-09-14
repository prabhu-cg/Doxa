/** Framework-agnostic slug helpers shared by every feature that needs a
 * human-readable, URL-safe identifier (Organization, Space, Board, Item,
 * ItemType, Status, Category, Tag). Collision handling is left to callers,
 * since the uniqueness scope (per-org, per-board, ...) differs per entity.
 */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.length > 0 ? base.slice(0, 48) : "item";
}

/** Appends a short random suffix on collision rather than failing the request. */
export async function generateUniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  if (!(await isTaken(base))) return base;

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
