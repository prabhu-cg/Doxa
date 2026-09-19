import "server-only";
import { db } from "@/server/db";

export type BlockedParticipant = {
  userId: string;
  displayName: string;
  blockedAt: Date;
};

export async function listBlockedParticipants(
  organizationId: string,
): Promise<BlockedParticipant[]> {
  const blocks = await db.participantBlock.findMany({
    where: { organizationId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return blocks.map((block) => ({
    userId: block.userId,
    displayName: block.user.displayName,
    blockedAt: block.createdAt,
  }));
}

/** The user ids on the organisation's team — used to label their words as
 * the team's. */
export async function listTeamMemberIds(
  organizationId: string,
): Promise<Set<string>> {
  const members = await db.membership.findMany({
    where: { organizationId },
    select: { userId: true },
  });
  return new Set(members.map((member) => member.userId));
}
