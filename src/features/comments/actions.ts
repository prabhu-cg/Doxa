"use server";

import { db } from "@/server/db";
import { requireItemParticipation } from "@/features/participation/access";
import { checkCommentRate } from "@/features/participation/rate-limit";
import { revalidateItem } from "@/features/participation/revalidate";
import { logActivity } from "@/features/activity/log";
import { ensureFollowing } from "@/features/followers/ensure";
import {
  notifyCommentAdded,
  notifyMentions,
} from "@/features/notifications/create";
import { resolveMentionedProfileIds } from "./mentions";
import { createCommentSchema, updateCommentSchema } from "./schema";
import {
  canCommentOnItem,
  canDeleteComment,
  canEditComment,
} from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createComment(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
  input: { body: string; parentId?: string },
): Promise<ActionResult> {
  const access = await requireItemParticipation(orgSlug, boardSlug, itemSlug);
  if (!access.ok) return { success: false, error: access.error };
  const { profile, role, organization, item } = access;
  if (!canCommentOnItem(role)) {
    return {
      success: false,
      error: "You don't have permission to comment on this item",
    };
  }
  if (role === null) {
    const rate = await checkCommentRate(organization.id, profile.id);
    if (!rate.allowed) return { success: false, error: rate.error };
  }

  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  let parentId: string | undefined;
  if (parsed.data.parentId) {
    const parent = await db.comment.findFirst({
      where: { id: parsed.data.parentId, itemId: item.id, deletedAt: null },
    });
    if (!parent)
      return { success: false, error: "That comment no longer exists" };
    // One level of nesting only — a reply to a reply collapses onto the
    // same top-level thread. See prisma/schema.prisma's Comment model.
    parentId = parent.parentId ?? parent.id;
  }

  const organizationId = organization.id;
  const mentionedIds = await resolveMentionedProfileIds(
    organizationId,
    parsed.data.body,
  );

  const comment = await db.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        itemId: item.id,
        authorId: profile.id,
        parentId,
        body: parsed.data.body,
      },
    });

    if (mentionedIds.length > 0) {
      await tx.commentMention.createMany({
        data: mentionedIds.map((mentionedId) => ({
          commentId: created.id,
          mentionedId,
        })),
        skipDuplicates: true,
      });
    }

    await logActivity(tx, {
      itemId: item.id,
      actorId: profile.id,
      type: "COMMENT_ADDED",
      data: { commentId: created.id },
    });
    await ensureFollowing(tx, item.id, profile.id);

    return created;
  });

  await notifyCommentAdded({
    organizationId,
    itemId: item.id,
    commentId: comment.id,
    actorId: profile.id,
    parentId,
  });
  if (mentionedIds.length > 0) {
    await notifyMentions({
      organizationId,
      itemId: item.id,
      commentId: comment.id,
      actorId: profile.id,
      mentionedIds,
    });
  }

  revalidateItem(orgSlug, boardSlug, itemSlug);
  return { success: true };
}

export async function updateComment(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
  commentId: string,
  input: { body: string },
): Promise<ActionResult> {
  const access = await requireItemParticipation(orgSlug, boardSlug, itemSlug);
  if (!access.ok) return { success: false, error: access.error };
  const { profile, item } = access;
  const comment = await db.comment.findFirst({
    where: { id: commentId, itemId: item.id, deletedAt: null },
  });
  if (!comment)
    return { success: false, error: "That comment no longer exists" };
  if (!canEditComment(comment.authorId === profile.id)) {
    return { success: false, error: "You can only edit your own comments" };
  }

  const parsed = updateCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  await db.comment.update({
    where: { id: comment.id },
    data: { body: parsed.data.body, editedAt: new Date() },
  });

  revalidateItem(orgSlug, boardSlug, itemSlug);
  return { success: true };
}

/** Covers both self-delete and admin+ moderation deletion — see
 * canDeleteComment. Soft-deletes and clears the body so moderated content
 * doesn't linger in the database, while the row (and its replies) stay in
 * place for thread structure. */
export async function deleteComment(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
  commentId: string,
): Promise<ActionResult> {
  const access = await requireItemParticipation(orgSlug, boardSlug, itemSlug);
  if (!access.ok) return { success: false, error: access.error };
  const { profile, role, item } = access;
  const comment = await db.comment.findFirst({
    where: { id: commentId, itemId: item.id, deletedAt: null },
  });
  if (!comment)
    return { success: false, error: "That comment no longer exists" };
  if (!canDeleteComment(role, comment.authorId === profile.id)) {
    return {
      success: false,
      error: "You don't have permission to delete this comment",
    };
  }

  await db.comment.update({
    where: { id: comment.id },
    data: { deletedAt: new Date(), body: "" },
  });

  revalidateItem(orgSlug, boardSlug, itemSlug);
  return { success: true };
}
