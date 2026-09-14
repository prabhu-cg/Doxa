"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { statusSchema } from "./schema";
import { generateUniqueStatusSlug } from "./slug";
import { canManageStatuses } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createStatus(
  orgSlug: string,
  input: { name: string; color?: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageStatuses(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage statuses",
    };
  }

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueStatusSlug(
    membership.organization.id,
    parsed.data.name,
  );

  await db.status.create({
    data: {
      organizationId: membership.organization.id,
      name: parsed.data.name,
      color: parsed.data.color,
      slug,
    },
  });

  revalidatePath(`/org/${orgSlug}/settings/statuses`);
  return { success: true };
}

export async function updateStatus(
  orgSlug: string,
  statusId: string,
  input: { name: string; color?: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageStatuses(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage statuses",
    };
  }

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { count } = await db.status.updateMany({
    where: { id: statusId, organizationId: membership.organization.id },
    data: { name: parsed.data.name, color: parsed.data.color },
  });
  if (count === 0) return { success: false, error: "Status not found" };

  revalidatePath(`/org/${orgSlug}/settings/statuses`);
  return { success: true };
}

async function setArchived(
  orgSlug: string,
  statusId: string,
  archivedAt: Date | null,
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageStatuses(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage statuses",
    };
  }

  const { count } = await db.status.updateMany({
    where: { id: statusId, organizationId: membership.organization.id },
    data: { archivedAt },
  });
  if (count === 0) return { success: false, error: "Status not found" };

  revalidatePath(`/org/${orgSlug}/settings/statuses`);
  return { success: true };
}

export async function archiveStatus(
  orgSlug: string,
  statusId: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, statusId, new Date());
}

export async function restoreStatus(
  orgSlug: string,
  statusId: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, statusId, null);
}

/** Marks one status as the default a new Item starts in, and unmarks every
 * other status in the organisation — kept atomic via a transaction so
 * there's never a moment with two (or zero) defaults. */
export async function setDefaultStatus(
  orgSlug: string,
  statusId: string,
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageStatuses(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage statuses",
    };
  }

  const target = await db.status.findFirst({
    where: { id: statusId, organizationId: membership.organization.id },
  });
  if (!target) return { success: false, error: "Status not found" };

  await db.$transaction([
    db.status.updateMany({
      where: { organizationId: membership.organization.id },
      data: { isDefault: false },
    }),
    db.status.update({ where: { id: target.id }, data: { isDefault: true } }),
  ]);

  revalidatePath(`/org/${orgSlug}/settings/statuses`);
  return { success: true };
}
