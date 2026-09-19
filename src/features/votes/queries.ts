import "server-only";
import { db } from "@/server/db";

export async function getVoteCountForItem(itemId: string): Promise<number> {
  return db.vote.count({ where: { itemId } });
}

export async function hasUserVotedForItem(
  itemId: string,
  userId: string,
): Promise<boolean> {
  const vote = await db.vote.findUnique({
    where: { itemId_userId: { itemId, userId } },
  });
  return !!vote;
}

/** Which of these items the user has voted on, for showing their votes in a list. */
export async function listVotedItemIds(
  userId: string,
  itemIds: string[],
): Promise<Set<string>> {
  if (itemIds.length === 0) return new Set();
  const votes = await db.vote.findMany({
    where: { userId, itemId: { in: itemIds } },
    select: { itemId: true },
  });
  return new Set(votes.map((vote) => vote.itemId));
}
