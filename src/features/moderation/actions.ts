"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireItemForOrgMember } from "@/features/items/queries";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { logActivity } from "@/features/activity/log";
import { revalidateItem } from "@/features/participation/revalidate";
import { canModerateCommunity } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

const NOT_ALLOWED = "You don't have permission to moderate submissions";

/** Puts a submission that was waiting for review onto the public board. */
export async function approveSubmission(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  const { profile, membership, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  if (!canModerateCommunity(membership.role)) {
    return { success: false, error: NOT_ALLOWED };
  }
  if (!item.awaitingReview) {
    return {
      success: false,
      error: "This submission isn't waiting for review",
    };
  }

  await db.$transaction([
    db.item.update({ where: { id: item.id }, data: { awaitingReview: false } }),
    logActivity(db, {
      itemId: item.id,
      actorId: profile.id,
      type: "ITEM_EDITED",
      data: { approved: true },
    }),
  ]);

  revalidateItem(orgSlug, boardSlug, itemSlug);
  return { success: true };
}

/** Removes a submission that was waiting for review. Soft-deleted, like every
 * removal of an Item, so it never appears anywhere but can still be recovered
 * from the database. */
export async function declineSubmission(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  const { membership, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  if (!canModerateCommunity(membership.role)) {
    return { success: false, error: NOT_ALLOWED };
  }
  if (!item.awaitingReview) {
    return {
      success: false,
      error: "This submission isn't waiting for review",
    };
  }

  await db.item.update({
    where: { id: item.id },
    data: { deletedAt: new Date() },
  });

  revalidateItem(orgSlug, boardSlug, itemSlug);
  return { success: true };
}

/** Bars a participant from voting, commenting, following and submitting on
 * this organisation's boards. Members can't be blocked — that would be
 * removing their membership, which has its own flow. */
export async function blockParticipant(
  orgSlug: string,
  userId: string,
): Promise<ActionResult> {
  const { profile, membership } = await requireOrganizationMembership(orgSlug);
  if (!canModerateCommunity(membership.role)) {
    return { success: false, error: NOT_ALLOWED };
  }

  const organizationId = membership.organization.id;
  const targetMembership = await db.membership.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (targetMembership) {
    return { success: false, error: "Members of the team can't be blocked" };
  }
  const target = await db.profile.findUnique({ where: { id: userId } });
  if (!target) return { success: false, error: "That person doesn't exist" };

  await db.participantBlock.upsert({
    where: { organizationId_userId: { organizationId, userId } },
    update: {},
    create: { organizationId, userId, blockedById: profile.id },
  });

  revalidatePath(`/org/${orgSlug}`, "layout");
  return { success: true };
}

export async function unblockParticipant(
  orgSlug: string,
  userId: string,
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canModerateCommunity(membership.role)) {
    return { success: false, error: NOT_ALLOWED };
  }

  await db.participantBlock.deleteMany({
    where: { organizationId: membership.organization.id, userId },
  });

  revalidatePath(`/org/${orgSlug}`, "layout");
  return { success: true };
}
