import "server-only";
import { db } from "@/server/db";
import type { ItemFollower, Profile } from "@/generated/prisma/client";

export type FollowerWithUser = ItemFollower & { user: Profile };

export async function isFollowingItem(
  itemId: string,
  userId: string,
): Promise<boolean> {
  const follow = await db.itemFollower.findUnique({
    where: { itemId_userId: { itemId, userId } },
  });
  return !!follow;
}

export async function getFollowerCountForItem(itemId: string): Promise<number> {
  return db.itemFollower.count({ where: { itemId } });
}

export async function listFollowersForItem(
  itemId: string,
): Promise<FollowerWithUser[]> {
  return db.itemFollower.findMany({
    where: { itemId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}
