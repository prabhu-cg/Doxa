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
