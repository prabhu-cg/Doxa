import "server-only";
import { db } from "@/server/db";
import type { NotificationType, Prisma } from "@/generated/prisma/client";

type NotificationRow = {
  organizationId: string;
  userId: string;
  type: NotificationType;
  itemId?: string;
  commentId?: string;
  actorId?: string;
  data?: Prisma.InputJsonValue;
};

async function createNotifications(rows: NotificationRow[]) {
  if (rows.length === 0) return;
  await db.notification.createMany({ data: rows });
}

/**
 * Notifies an Item's followers about a new comment. Not a Server Action
 * itself — called from features/comments/actions.ts after a comment
 * commits. Each recipient gets at most one notification per comment: a
 * reply's parent-comment author gets the more specific COMMENT_REPLY;
 * every other follower (which already includes the Item's author and the
 * commenter themself, both auto-followed — see
 * features/followers/ensure.ts) gets the generic ITEM_COMMENT, and the
 * commenter is never notified about their own comment.
 */
export async function notifyCommentAdded(params: {
  organizationId: string;
  itemId: string;
  commentId: string;
  actorId: string;
  parentId?: string;
}) {
  const recipients = new Map<string, NotificationType>();

  const followers = await db.itemFollower.findMany({
    where: { itemId: params.itemId },
    select: { userId: true },
  });
  for (const follower of followers) {
    if (follower.userId !== params.actorId) {
      recipients.set(follower.userId, "ITEM_COMMENT");
    }
  }

  if (params.parentId) {
    const parent = await db.comment.findUnique({
      where: { id: params.parentId },
      select: { authorId: true },
    });
    if (parent && parent.authorId !== params.actorId) {
      recipients.set(parent.authorId, "COMMENT_REPLY");
    }
  }

  await createNotifications(
    [...recipients].map(([userId, type]) => ({
      organizationId: params.organizationId,
      userId,
      type,
      itemId: params.itemId,
      commentId: params.commentId,
      actorId: params.actorId,
    })),
  );
}

/** One MENTION notification per mentioned user, excluding the author of
 * the comment that mentioned them. */
export async function notifyMentions(params: {
  organizationId: string;
  itemId: string;
  commentId: string;
  actorId: string;
  mentionedIds: string[];
}) {
  await createNotifications(
    params.mentionedIds
      .filter((userId) => userId !== params.actorId)
      .map((userId) => ({
        organizationId: params.organizationId,
        userId,
        type: "MENTION" as const,
        itemId: params.itemId,
        commentId: params.commentId,
        actorId: params.actorId,
      })),
  );
}

/** Notifies every follower (except whoever changed the status) that a
 * followed Item's status changed. */
export async function notifyStatusChanged(params: {
  organizationId: string;
  itemId: string;
  actorId: string;
  fromStatus: string;
  toStatus: string;
}) {
  const followers = await db.itemFollower.findMany({
    where: { itemId: params.itemId, userId: { not: params.actorId } },
    select: { userId: true },
  });

  await createNotifications(
    followers.map((follower) => ({
      organizationId: params.organizationId,
      userId: follower.userId,
      type: "ITEM_STATUS_CHANGED" as const,
      itemId: params.itemId,
      actorId: params.actorId,
      data: { fromStatus: params.fromStatus, toStatus: params.toStatus },
    })),
  );
}

/**
 * Tells everyone who voted on an Item, or follows it, that a decision was
 * recorded on it — the point of recording a reason is that the people who
 * cared get to hear it. Voting doesn't make someone a follower, so both groups
 * are needed; each person gets one notification, and whoever recorded the
 * decision gets none.
 */
export async function notifyDecisionRecorded(params: {
  organizationId: string;
  itemId: string;
  actorId: string;
  decisionType: string;
  roadmapStage?: string | null;
}) {
  const [voters, followers] = await Promise.all([
    db.vote.findMany({
      where: { itemId: params.itemId },
      select: { userId: true },
    }),
    db.itemFollower.findMany({
      where: { itemId: params.itemId },
      select: { userId: true },
    }),
  ]);

  const recipients = new Set([...voters, ...followers].map((r) => r.userId));
  recipients.delete(params.actorId);

  await createNotifications(
    [...recipients].map((userId) => ({
      organizationId: params.organizationId,
      userId,
      type: "ITEM_DECISION" as const,
      itemId: params.itemId,
      actorId: params.actorId,
      data: {
        decisionType: params.decisionType,
        ...(params.roadmapStage ? { roadmapStage: params.roadmapStage } : {}),
      },
    })),
  );
}

/**
 * Tells the team (owners and admins) that a community participant submitted an
 * Item, and whether it is waiting for their review. Members who submit
 * their own items are never announced this way.
 */
export async function notifyItemSubmitted(params: {
  organizationId: string;
  itemId: string;
  actorId: string;
  awaitingReview: boolean;
}) {
  const moderators = await db.membership.findMany({
    where: {
      organizationId: params.organizationId,
      role: { in: ["OWNER", "ADMIN"] },
      userId: { not: params.actorId },
    },
    select: { userId: true },
  });

  await createNotifications(
    moderators.map((moderator) => ({
      organizationId: params.organizationId,
      userId: moderator.userId,
      type: "ITEM_SUBMITTED" as const,
      itemId: params.itemId,
      actorId: params.actorId,
      data: { awaitingReview: params.awaitingReview },
    })),
  );
}
