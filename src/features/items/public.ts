import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getAuthenticatedSupabaseUser } from "@/features/auth/queries";
import { getViewer, type Viewer } from "@/features/participation/access";
import { getVisibleItem } from "./queries";

type Loaded = NonNullable<Awaited<ReturnType<typeof getVisibleItem>>>;

/**
 * A public item and who is looking at it, loaded once per request so the
 * drawer's header and its body (or the page's title and its content) share it.
 * Null for everything the visitor may not see — see getVisibleItem.
 */
export const findPublicItem = cache(
  async (
    orgSlug: string,
    boardSlug: string,
    itemSlug: string,
  ): Promise<(Loaded & { viewer: Viewer }) | null> => {
    const user = await getAuthenticatedSupabaseUser();
    // The viewer's id lets the person who submitted it see it while it is
    // still waiting for review.
    const visible = await getVisibleItem(
      orgSlug,
      boardSlug,
      itemSlug,
      user?.id,
    );
    if (!visible) return null;
    const viewer = await getViewer(visible.organization.id, user);
    return { ...visible, viewer };
  },
);

/** The same, as a 404 for everything the visitor may not see — for an item's own page. */
export async function loadPublicItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
) {
  const loaded = await findPublicItem(orgSlug, boardSlug, itemSlug);
  if (!loaded) notFound();
  return loaded;
}
