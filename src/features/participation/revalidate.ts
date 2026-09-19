import "server-only";
import { revalidatePath } from "next/cache";

/** An item shows on both its team page and its public page; a change to it
 * has to refresh both. */
export function revalidateItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
) {
  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}/${itemSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}`);
}
