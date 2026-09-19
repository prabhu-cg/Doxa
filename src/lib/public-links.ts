/**
 * Paths of the public, read-only pages under `/b/`. A board has one only while
 * it is Public and not archived; an item only while it is not archived either.
 * Slugs are already URL-safe, so they go in as they are.
 */
export function publicBoardPath(orgSlug: string, boardSlug: string): string {
  return `/b/${orgSlug}/${boardSlug}`;
}

export function publicItemPath(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): string {
  return `${publicBoardPath(orgSlug, boardSlug)}/${itemSlug}`;
}

/**
 * An organisation's public roadmap. Deliberately not under `/b/<org>/…`: a
 * board slugged "roadmap" would then be shadowed by this page.
 */
export function publicRoadmapPath(orgSlug: string): string {
  return `/r/${orgSlug}`;
}
