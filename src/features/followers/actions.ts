"use server";

import { db } from "@/server/db";
import { requireItemParticipation } from "@/features/participation/access";
import { revalidateItem } from "@/features/participation/revalidate";
import { canFollowItem } from "./permissions";
import { ensureFollowing } from "./ensure";

type ActionResult = { success: true } | { success: false; error: string };

export async function followItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  const access = await requireItemParticipation(orgSlug, boardSlug, itemSlug);
  if (!access.ok) return { success: false, error: access.error };
  const { profile, role, item } = access;
  if (!canFollowItem(role)) {
    return {
      success: false,
      error: "You don't have permission to follow this item",
    };
  }

  await ensureFollowing(db, item.id, profile.id);

  revalidateItem(orgSlug, boardSlug, itemSlug);
  return { success: true };
}

export async function unfollowItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  const access = await requireItemParticipation(orgSlug, boardSlug, itemSlug);
  if (!access.ok) return { success: false, error: access.error };
  const { profile, item } = access;

  await db.itemFollower.deleteMany({
    where: { itemId: item.id, userId: profile.id },
  });

  revalidateItem(orgSlug, boardSlug, itemSlug);
  return { success: true };
}
