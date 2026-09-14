"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createComment,
  deleteComment,
  updateComment,
} from "@/features/comments/actions";
import type { CommentData } from "@/features/comments/mapper";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function formatTimestamp(date: Date) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type SubmitResult = { success: boolean; error?: string };

function CommentForm({
  placeholder,
  submitLabel,
  initialValue = "",
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  submitLabel: string;
  initialValue?: string;
  onSubmit: (body: string) => Promise<SubmitResult>;
  onCancel?: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || pending) return;
    setPending(true);
    setError(null);
    const result = await onSubmit(value);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong");
      return;
    }
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={3}
        aria-label={placeholder}
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Posting…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  orgSlug,
  boardSlug,
  itemSlug,
  currentUserId,
  canComment,
  canModerate,
  isReply,
}: {
  comment: CommentData;
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  currentUserId: string;
  canComment: boolean;
  canModerate: boolean;
  isReply: boolean;
}) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleted, setDeleted] = useState(!!comment.deletedAt);
  const isAuthor = comment.authorId === currentUserId;
  const canEdit = isAuthor && !deleted;
  const canDelete = (isAuthor || canModerate) && !deleted;

  async function handleDelete() {
    if (!window.confirm("Delete this comment?")) return;
    const result = await deleteComment(
      orgSlug,
      boardSlug,
      itemSlug,
      comment.id,
    );
    if (result.success) {
      setDeleted(true);
      router.refresh();
    }
  }

  return (
    <li className="space-y-2">
      <div className="flex items-start gap-2.5">
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="text-xs">
            {comment.authorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm font-semibold">{comment.authorName}</span>
            <span className="text-muted-foreground text-xs">
              {formatTimestamp(comment.createdAt)}
              {comment.editedAt ? " (edited)" : ""}
            </span>
          </div>

          {editing ? (
            <CommentForm
              placeholder="Edit your comment…"
              submitLabel="Save"
              initialValue={comment.body}
              onCancel={() => setEditing(false)}
              onSubmit={async (body) => {
                const result = await updateComment(
                  orgSlug,
                  boardSlug,
                  itemSlug,
                  comment.id,
                  { body },
                );
                if (result.success) {
                  setEditing(false);
                  router.refresh();
                }
                return result;
              }}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {deleted ? (
                <span className="text-muted-foreground italic">[deleted]</span>
              ) : (
                comment.body
              )}
            </p>
          )}

          {!deleted && !editing ? (
            <div className="flex gap-3">
              {canComment && !isReply ? (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground text-xs"
                  onClick={() => setReplying((r) => !r)}
                >
                  Reply
                </button>
              ) : null}
              {canEdit ? (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground text-xs"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  className="text-destructive text-xs hover:underline"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              ) : null}
            </div>
          ) : null}

          {replying ? (
            <CommentForm
              placeholder="Write a reply…"
              submitLabel="Reply"
              onCancel={() => setReplying(false)}
              onSubmit={async (body) => {
                const result = await createComment(
                  orgSlug,
                  boardSlug,
                  itemSlug,
                  {
                    body,
                    parentId: comment.id,
                  },
                );
                if (result.success) {
                  setReplying(false);
                  router.refresh();
                }
                return result;
              }}
            />
          ) : null}
        </div>
      </div>

      {comment.replies.length > 0 ? (
        <ul className="ml-9 space-y-3 border-l pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              orgSlug={orgSlug}
              boardSlug={boardSlug}
              itemSlug={itemSlug}
              currentUserId={currentUserId}
              canComment={canComment}
              canModerate={canModerate}
              isReply
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CommentSection({
  orgSlug,
  boardSlug,
  itemSlug,
  comments,
  currentUserId,
  canComment,
  canModerate,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  comments: CommentData[];
  currentUserId: string;
  canComment: boolean;
  canModerate: boolean;
}) {
  const router = useRouter();

  return (
    <div className="space-y-5">
      {canComment ? (
        <CommentForm
          placeholder="Write a comment… (@mention a teammate)"
          submitLabel="Comment"
          onSubmit={async (body) => {
            const result = await createComment(orgSlug, boardSlug, itemSlug, {
              body,
            });
            if (result.success) router.refresh();
            return result;
          }}
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          Only organisation members can comment.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-muted-foreground text-sm">No comments yet.</p>
      ) : (
        <ul className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              orgSlug={orgSlug}
              boardSlug={boardSlug}
              itemSlug={itemSlug}
              currentUserId={currentUserId}
              canComment={canComment}
              canModerate={canModerate}
              isReply={false}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
