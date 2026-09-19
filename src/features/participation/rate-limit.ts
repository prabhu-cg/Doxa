import "server-only";
import { db } from "@/server/db";

/**
 * Per-person ceilings on what a community participant can do in an hour,
 * per organisation. They exist so one account can't flood a board; they are
 * far above what a real person does. Members are never limited.
 *
 * Counted from the rows themselves rather than a separate counter, the same
 * "compute on read, can't drift" rule as vote counts — and no extra infrastructure.
 */
export const PARTICIPATION_LIMITS = {
  submissionsPerHour: 5,
  /** Submissions waiting for review at once — stops a queue being buried. */
  pendingSubmissions: 10,
  commentsPerHour: 20,
  votesPerHour: 60,
} as const;

const HOUR_MS = 60 * 60 * 1000;

function anHourAgo(now: Date) {
  return new Date(now.getTime() - HOUR_MS);
}

export type RateCheck = { allowed: true } | { allowed: false; error: string };

const ALLOWED: RateCheck = { allowed: true };

function tooMany(what: string): RateCheck {
  return {
    allowed: false,
    error: `You're ${what} too quickly — please try again in a little while`,
  };
}

export async function checkSubmissionRate(
  organizationId: string,
  userId: string,
  now = new Date(),
): Promise<RateCheck> {
  const [recent, pending] = await Promise.all([
    db.item.count({
      where: {
        organizationId,
        authorId: userId,
        origin: "COMMUNITY",
        createdAt: { gte: anHourAgo(now) },
      },
    }),
    db.item.count({
      where: {
        organizationId,
        authorId: userId,
        awaitingReview: true,
        deletedAt: null,
      },
    }),
  ]);
  if (recent >= PARTICIPATION_LIMITS.submissionsPerHour) {
    return tooMany("submitting");
  }
  if (pending >= PARTICIPATION_LIMITS.pendingSubmissions) {
    return {
      allowed: false,
      error:
        "You already have several submissions waiting for review — please wait until the team has looked at them",
    };
  }
  return ALLOWED;
}

export async function checkCommentRate(
  organizationId: string,
  userId: string,
  now = new Date(),
): Promise<RateCheck> {
  const recent = await db.comment.count({
    where: {
      authorId: userId,
      item: { organizationId },
      createdAt: { gte: anHourAgo(now) },
    },
  });
  return recent >= PARTICIPATION_LIMITS.commentsPerHour
    ? tooMany("commenting")
    : ALLOWED;
}

/** Counts VOTE_ADDED activity rather than live votes, so voting and unvoting
 * in a loop still counts every time. */
export async function checkVoteRate(
  organizationId: string,
  userId: string,
  now = new Date(),
): Promise<RateCheck> {
  const recent = await db.itemActivity.count({
    where: {
      actorId: userId,
      type: "VOTE_ADDED",
      item: { organizationId },
      createdAt: { gte: anHourAgo(now) },
    },
  });
  return recent >= PARTICIPATION_LIMITS.votesPerHour
    ? tooMany("voting")
    : ALLOWED;
}
