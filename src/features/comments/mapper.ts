import type { CommentWithReplies } from "./queries";

/** Plain client-safe shape of a Comment (+ author, + one level of
 * replies) — kept in a non-"use client" module so Server Components can
 * call toCommentData() directly (a function exported from a "use client"
 * file can only be passed as a prop/rendered, never invoked from a
 * Server Component). */
export type CommentData = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  replies: CommentData[];
};

export function toCommentData(comment: CommentWithReplies): CommentData {
  return {
    id: comment.id,
    body: comment.body,
    authorId: comment.authorId,
    authorName: comment.author.displayName,
    createdAt: comment.createdAt,
    editedAt: comment.editedAt,
    deletedAt: comment.deletedAt,
    replies: comment.replies.map((reply) => ({
      id: reply.id,
      body: reply.body,
      authorId: reply.authorId,
      authorName: reply.author.displayName,
      createdAt: reply.createdAt,
      editedAt: reply.editedAt,
      deletedAt: reply.deletedAt,
      replies: [],
    })),
  };
}
