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
  /** Whether the author is on the organisation's team, so the UI can say so. */
  authorIsTeam: boolean;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  replies: CommentData[];
};

export function toCommentData(
  comment: CommentWithReplies,
  teamIds: ReadonlySet<string>,
): CommentData {
  return {
    id: comment.id,
    body: comment.body,
    authorId: comment.authorId,
    authorName: comment.author.displayName,
    authorIsTeam: teamIds.has(comment.authorId),
    createdAt: comment.createdAt,
    editedAt: comment.editedAt,
    deletedAt: comment.deletedAt,
    replies: comment.replies.map((reply) => ({
      id: reply.id,
      body: reply.body,
      authorId: reply.authorId,
      authorName: reply.author.displayName,
      authorIsTeam: teamIds.has(reply.authorId),
      createdAt: reply.createdAt,
      editedAt: reply.editedAt,
      deletedAt: reply.deletedAt,
      replies: [],
    })),
  };
}
