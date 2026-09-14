import "server-only";
import type { DbOrTx } from "@/server/db";

/**
 * Idempotently follows an Item on a user's behalf — used to auto-follow
 * an Item's author on creation and a commenter on comment, so "you get
 * notified about activity on things you're involved in" doesn't require
 * an explicit follow first. Not a Server Action itself; called from
 * within features/items/actions.ts and features/comments/actions.ts.
 */
export function ensureFollowing(
  client: DbOrTx,
  itemId: string,
  userId: string,
) {
  return client.itemFollower.upsert({
    where: { itemId_userId: { itemId, userId } },
    update: {},
    create: { itemId, userId },
  });
}
