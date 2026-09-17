"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireBoardForOrgMember } from "@/features/boards/queries";
import { requireItemForOrgMember } from "./queries";
import { getDefaultStatus } from "@/features/statuses/queries";
import { getDefaultPriority } from "@/features/priorities/queries";
import { canCreateItem as checkItemLimit } from "@/features/entitlements/queries";
import { resolveOrCreateTagIds } from "@/features/tags/resolve";
import { createItemSchema, updateItemSchema } from "./schema";
import { generateUniqueItemSlug } from "./slug";
import { canArchiveItem, canCreateItem, canEditItem } from "./permissions";
import { logActivity } from "@/features/activity/log";
import { ensureFollowing } from "@/features/followers/ensure";
import { notifyStatusChanged } from "@/features/notifications/create";

type ActionResult = { success: true } | { success: false; error: string };

export async function createItem(
  orgSlug: string,
  boardSlug: string,
  input: {
    title: string;
    description?: string;
    itemTypeId: string;
    categoryId?: string;
    tagNames?: string[];
  },
): Promise<ActionResult & { slug?: string }> {
  const { profile, membership, board } = await requireBoardForOrgMember(
    orgSlug,
    boardSlug,
  );
  if (!canCreateItem(membership.role)) {
    return {
      success: false,
      error: "You don't have permission to submit items",
    };
  }

  const organizationId = membership.organization.id;
  const limitCheck = await checkItemLimit(organizationId);
  if (!limitCheck.allowed) {
    return {
      success: false,
      error: `This organisation's plan allows up to ${limitCheck.limit} items. Upgrade to submit more.`,
    };
  }

  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // itemTypeId/categoryId are client-supplied <select> values — re-verify
  // they belong to this organisation before trusting them.
  const itemType = await db.itemType.findFirst({
    where: { id: parsed.data.itemTypeId, organizationId, archivedAt: null },
  });
  if (!itemType) return { success: false, error: "Choose a valid item type" };

  let categoryId: string | undefined;
  if (parsed.data.categoryId) {
    const category = await db.category.findFirst({
      where: { id: parsed.data.categoryId, organizationId },
    });
    if (!category) return { success: false, error: "Choose a valid category" };
    categoryId = category.id;
  }

  const defaultStatus = await getDefaultStatus(organizationId);
  if (!defaultStatus) {
    return {
      success: false,
      error: "This organisation has no active statuses configured",
    };
  }

  const defaultPriority = await getDefaultPriority(organizationId);
  if (!defaultPriority) {
    return {
      success: false,
      error: "This organisation has no active priorities configured",
    };
  }

  const slug = await generateUniqueItemSlug(board.id, parsed.data.title);
  const tagIds = await resolveOrCreateTagIds(
    organizationId,
    parsed.data.tagNames,
  );

  const item = await db.$transaction(async (tx) => {
    const created = await tx.item.create({
      data: {
        organizationId,
        spaceId: board.spaceId,
        boardId: board.id,
        itemTypeId: itemType.id,
        statusId: defaultStatus.id,
        priorityId: defaultPriority.id,
        categoryId,
        authorId: profile.id,
        title: parsed.data.title,
        description: parsed.data.description,
        slug,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
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

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}`);
  return { success: true, slug: item.slug };
}

export async function updateItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
  input: {
    title: string;
    description?: string;
    itemTypeId: string;
    statusId: string;
    priorityId: string;
    categoryId?: string;
    tagNames?: string[];
  },
): Promise<ActionResult> {
  const { profile, membership, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  if (!canEditItem(membership.role, item.authorId === profile.id)) {
    return {
      success: false,
      error: "You don't have permission to edit this item",
    };
  }

  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const organizationId = membership.organization.id;

  const itemType = await db.itemType.findFirst({
    where: { id: parsed.data.itemTypeId, organizationId, archivedAt: null },
  });
  if (!itemType) return { success: false, error: "Choose a valid item type" };

  const status = await db.status.findFirst({
    where: { id: parsed.data.statusId, organizationId, archivedAt: null },
  });
  if (!status) return { success: false, error: "Choose a valid status" };

  const priority = await db.priority.findFirst({
    where: { id: parsed.data.priorityId, organizationId, archivedAt: null },
  });
  if (!priority) return { success: false, error: "Choose a valid priority" };

  let categoryId: string | null = null;
  if (parsed.data.categoryId) {
    const category = await db.category.findFirst({
      where: { id: parsed.data.categoryId, organizationId },
    });
    if (!category) return { success: false, error: "Choose a valid category" };
    categoryId = category.id;
  }

  const tagIds = await resolveOrCreateTagIds(
    organizationId,
    parsed.data.tagNames,
  );

  const statusChanged = status.id !== item.statusId;
  const previousStatus = item.status;
  const priorityChanged = priority.id !== item.priorityId;
  const previousPriority = item.priority;

  const activityLogs = [];
  if (statusChanged) {
    activityLogs.push(
      logActivity(db, {
        itemId: item.id,
        actorId: profile.id,
        type: "STATUS_CHANGED",
        data: { fromStatus: previousStatus.name, toStatus: status.name },
      }),
    );
  }
  if (priorityChanged) {
    activityLogs.push(
      logActivity(db, {
        itemId: item.id,
        actorId: profile.id,
        type: "PRIORITY_CHANGED",
        data: {
          fromPriority: previousPriority.name,
          toPriority: priority.name,
        },
      }),
    );
  }
  if (!statusChanged && !priorityChanged) {
    activityLogs.push(
      logActivity(db, {
        itemId: item.id,
        actorId: profile.id,
        type: "ITEM_EDITED",
      }),
    );
  }

  await db.$transaction([
    db.item.update({
      where: { id: item.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        itemTypeId: itemType.id,
        statusId: status.id,
        priorityId: priority.id,
        categoryId,
      },
    }),
    db.itemTag.deleteMany({ where: { itemId: item.id } }),
    db.itemTag.createMany({
      data: tagIds.map((tagId) => ({ itemId: item.id, tagId })),
    }),
    ...activityLogs,
  ]);

  if (statusChanged) {
    await notifyStatusChanged({
      organizationId,
      itemId: item.id,
      actorId: profile.id,
      fromStatus: previousStatus.name,
      toStatus: status.name,
    });
  }

  // itemSlug is stable once assigned (see features/items/slug.ts) — a
  // title edit never changes the URL, so board.slug here is enough.
  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}/${itemSlug}`);
  return { success: true };
}

async function setArchived(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
  archivedAt: Date | null,
): Promise<ActionResult> {
  const { profile, membership, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  if (!canArchiveItem(membership.role, item.authorId === profile.id)) {
    return { success: false, error: "You don't have permission to do that" };
  }

  await db.$transaction([
    db.item.update({ where: { id: item.id }, data: { archivedAt } }),
    logActivity(db, {
      itemId: item.id,
      actorId: profile.id,
      type: archivedAt ? "ITEM_ARCHIVED" : "ITEM_RESTORED",
    }),
  ]);

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}`);
  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}/${itemSlug}`);
  return { success: true };
}

export async function archiveItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, boardSlug, itemSlug, new Date());
}

export async function restoreItem(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, boardSlug, itemSlug, null);
}
