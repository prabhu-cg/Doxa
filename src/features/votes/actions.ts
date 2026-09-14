"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { requireItemForOrgMember } from "@/features/items/queries";
import { logActivity } from "@/features/activity/log";
import { canVoteOnItem } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Adds the current user's vote. The (itemId, userId) unique constraint on
 * Vote (see prisma/schema.prisma) is what actually prevents a duplicate
 * vote under concurrent double-clicks — two racing inserts both reach the
 * database, one wins, the loser hits P2002 here and is treated as a
 * harmless no-op rather than an error the UI needs to surface.
 */
export async function addVote(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  const { profile, membership, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  if (!canVoteOnItem(membership.role)) {
    return {
      success: false,
      error: "You don't have permission to vote on this item",
    };
  }

  try {
    await db.$transaction([
      db.vote.create({ data: { itemId: item.id, userId: profile.id } }),
      logActivity(db, {
        itemId: item.id,
        actorId: profile.id,
        type: "VOTE_ADDED",
      }),
    ]);
  } catch (error) {
    const alreadyVoted =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002";
    if (!alreadyVoted) throw error;
  }

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  return { success: true };
}

export async function removeVote(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  const { profile, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );

  const deleted = await db.vote.deleteMany({
    where: { itemId: item.id, userId: profile.id },
  });
  if (deleted.count > 0) {
    await logActivity(db, {
      itemId: item.id,
      actorId: profile.id,
      type: "VOTE_REMOVED",
    });
  }

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  return { success: true };
}
