"use server";

import { db } from "@/server/db";
import { createItemSchema } from "@/features/items/schema";
import { generateUniqueItemSlug } from "@/features/items/slug";
import { createItem } from "@/features/items/actions";
import { getDefaultStatus } from "@/features/statuses/queries";
import { getDefaultPriority } from "@/features/priorities/queries";
import { logActivity } from "@/features/activity/log";
import { ensureFollowing } from "@/features/followers/ensure";
import { notifyItemSubmitted } from "@/features/notifications/create";
import { requireParticipation } from "./access";
import { checkSubmissionRate } from "./rate-limit";
import { revalidateItem } from "./revalidate";

type SubmitResult =
  | { success: true; slug: string; awaitingReview: boolean }
  | { success: false; error: string };

const submitItemSchema = createItemSchema.pick({
  title: true,
  description: true,
  itemTypeId: true,
});

/**
 * Submits an Item from a public board. A member's submission is an ordinary
 * team Item (same as the in-app form: plan limits, no review). Anyone else's
 * is a COMMUNITY Item: it never counts toward the plan's item cap, it is
 * rate limited, and it waits for a team member's approval first when the
 * board asks for that.
 */
export async function submitItem(
  orgSlug: string,
  boardSlug: string,
  input: { title: string; description?: string; itemTypeId: string },
): Promise<SubmitResult> {
  const access = await requireParticipation(orgSlug, boardSlug);
  if (!access.ok) return { success: false, error: access.error };
  const { profile, organization, board, role } = access;

  if (role !== null) {
    const created = await createItem(orgSlug, boardSlug, input);
    return created.success && created.slug
      ? { success: true, slug: created.slug, awaitingReview: false }
      : {
          success: false,
          error: created.success ? "Try again" : created.error,
        };
  }

  const rate = await checkSubmissionRate(organization.id, profile.id);
  if (!rate.allowed) return { success: false, error: rate.error };

  const parsed = submitItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // The type comes from a <select> the client controls — check it is one of
  // this organisation's.
  const itemType = await db.itemType.findFirst({
    where: {
      id: parsed.data.itemTypeId,
      organizationId: organization.id,
      archivedAt: null,
    },
  });
  if (!itemType) return { success: false, error: "Choose a valid type" };

  const [defaultStatus, defaultPriority] = await Promise.all([
    getDefaultStatus(organization.id),
    getDefaultPriority(organization.id),
  ]);
  if (!defaultStatus || !defaultPriority) {
    return {
      success: false,
      error: "This board can't take submissions right now",
    };
  }

  const awaitingReview = board.requireApproval;
  const slug = await generateUniqueItemSlug(board.id, parsed.data.title);

  const item = await db.$transaction(async (tx) => {
    const created = await tx.item.create({
      data: {
        organizationId: organization.id,
        spaceId: board.spaceId,
        boardId: board.id,
        itemTypeId: itemType.id,
        statusId: defaultStatus.id,
        priorityId: defaultPriority.id,
        authorId: profile.id,
        origin: "COMMUNITY",
        awaitingReview,
        title: parsed.data.title,
        description: parsed.data.description,
        slug,
      },
    });
    await logActivity(tx, {
      itemId: created.id,
      actorId: profile.id,
      type: "ITEM_CREATED",
    });
    await ensureFollowing(tx, created.id, profile.id);
    return created;
  });

  // Best-effort: telling the team is not worth losing a submission over.
  await notifyItemSubmitted({
    organizationId: organization.id,
    itemId: item.id,
    actorId: profile.id,
    awaitingReview,
  }).catch((error) => console.error("notifyItemSubmitted failed:", error));

  revalidateItem(orgSlug, boardSlug, item.slug);
  return { success: true, slug: item.slug, awaitingReview };
}
