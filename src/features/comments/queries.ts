import "server-only";
import { db } from "@/server/db";
import type { Comment, Profile } from "@/generated/prisma/client";

export type CommentWithReplies = Comment & {
  author: Profile;
  replies: (Comment & { author: Profile })[];
};

/** Top-level comments with their (one level of) replies nested inside,
 * both oldest-first. Soft-deleted comments are included, not filtered
 * out — the UI renders them as a "[deleted]" placeholder so thread
 * structure (a reply's parent) never has a hole in it. */
export async function listCommentsForItem(
  itemId: string,
): Promise<CommentWithReplies[]> {
  return db.comment.findMany({
    where: { itemId, parentId: null },
    include: {
      author: true,
      replies: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCommentForItem(itemId: string, commentId: string) {
  return db.comment.findFirst({
    where: { id: commentId, itemId, deletedAt: null },
  });
}

export async function countCommentsForItem(itemId: string): Promise<number> {
  return db.comment.count({ where: { itemId, deletedAt: null } });
}
