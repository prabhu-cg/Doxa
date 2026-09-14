"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { itemTypeSchema } from "./schema";
import { generateUniqueItemTypeSlug } from "./slug";
import { canManageItemTypes } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createItemType(
  orgSlug: string,
  input: { name: string; description?: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageItemTypes(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage item types",
    };
  }

  const parsed = itemTypeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueItemTypeSlug(
    membership.organization.id,
    parsed.data.name,
  );

  await db.itemType.create({
    data: {
      organizationId: membership.organization.id,
      name: parsed.data.name,
      description: parsed.data.description,
      slug,
    },
  });

  revalidatePath(`/org/${orgSlug}/settings/item-types`);
  return { success: true };
}

export async function updateItemType(
  orgSlug: string,
  itemTypeId: string,
  input: { name: string; description?: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageItemTypes(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage item types",
    };
  }

  const parsed = itemTypeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { count } = await db.itemType.updateMany({
    where: { id: itemTypeId, organizationId: membership.organization.id },
    data: { name: parsed.data.name, description: parsed.data.description },
  });
  if (count === 0) return { success: false, error: "Item type not found" };

  revalidatePath(`/org/${orgSlug}/settings/item-types`);
  return { success: true };
}

async function setArchived(
  orgSlug: string,
  itemTypeId: string,
  archivedAt: Date | null,
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageItemTypes(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage item types",
    };
  }

  const { count } = await db.itemType.updateMany({
    where: { id: itemTypeId, organizationId: membership.organization.id },
    data: { archivedAt },
  });
  if (count === 0) return { success: false, error: "Item type not found" };

  revalidatePath(`/org/${orgSlug}/settings/item-types`);
  return { success: true };
}

export async function archiveItemType(
  orgSlug: string,
  itemTypeId: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, itemTypeId, new Date());
}

export async function restoreItemType(
  orgSlug: string,
  itemTypeId: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, itemTypeId, null);
}
