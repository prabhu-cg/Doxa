import type { BreadcrumbItem } from "@/components/breadcrumbs";

/**
 * The parent chains shared by several pages, so a route's URL is spelled in
 * one place. A page appends its own final (current-page) crumb.
 *
 * A board's parent is its space, so a board's trail runs
 * Spaces › Space › Board even though its URL is flat (`/boards/[slug]`).
 */

export function spacesTrail(orgSlug: string): BreadcrumbItem[] {
  return [{ label: "Spaces", href: `/org/${orgSlug}/spaces` }];
}

export function spaceTrail(
  orgSlug: string,
  space: { slug: string; name: string },
): BreadcrumbItem[] {
  return [
    ...spacesTrail(orgSlug),
    { label: space.name, href: `/org/${orgSlug}/spaces/${space.slug}` },
  ];
}

export function boardTrail(
  orgSlug: string,
  board: { slug: string; name: string; space: { slug: string; name: string } },
): BreadcrumbItem[] {
  return [
    ...spaceTrail(orgSlug, board.space),
    { label: board.name, href: `/org/${orgSlug}/boards/${board.slug}` },
  ];
}

export function boardsTrail(orgSlug: string): BreadcrumbItem[] {
  return [{ label: "Boards", href: `/org/${orgSlug}/boards` }];
}

export function settingsTrail(orgSlug: string): BreadcrumbItem[] {
  return [{ label: "Settings", href: `/org/${orgSlug}/settings` }];
}
