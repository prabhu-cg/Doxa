"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireItemForOrgMember } from "@/features/items/queries";
import { canFollowItem } from "./permissions";
import { ensureFollowing } from "./ensure";

type ActionResult = { success: true } | { success: false; error: string };

export async function followItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  const { profile, membership, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  if (!canFollowItem(membership.role)) {
    return {
      success: false,
      error: "You don't have permission to follow this item",
    };
  }

  await ensureFollowing(db, item.id, profile.id);

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  return { success: true };
}

export async function unfollowItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  const { profile, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );

  await db.itemFollower.deleteMany({
    where: { itemId: item.id, userId: profile.id },
  });

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  return { success: true };
}
