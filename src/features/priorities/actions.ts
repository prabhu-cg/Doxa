"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { prioritySchema } from "./schema";
import { generateUniquePrioritySlug } from "./slug";
import { canManagePriorities } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createPriority(
  orgSlug: string,
  input: { name: string; color?: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManagePriorities(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage priorities",
    };
  }

  const parsed = prioritySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniquePrioritySlug(
    membership.organization.id,
    parsed.data.name,
  );

  const highest = await db.priority.findFirst({
    where: { organizationId: membership.organization.id },
    orderBy: { sortOrder: "desc" },
  });

  await db.priority.create({
    data: {
      organizationId: membership.organization.id,
      name: parsed.data.name,
      color: parsed.data.color,
      slug,
      sortOrder: (highest?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/org/${orgSlug}/settings/priorities`);
  return { success: true };
}

export async function updatePriority(
  orgSlug: string,
  priorityId: string,
  input: { name: string; color?: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManagePriorities(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage priorities",
    };
  }

  const parsed = prioritySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { count } = await db.priority.updateMany({
    where: { id: priorityId, organizationId: membership.organization.id },
    data: { name: parsed.data.name, color: parsed.data.color },
  });
  if (count === 0) return { success: false, error: "Priority not found" };

  revalidatePath(`/org/${orgSlug}/settings/priorities`);
  return { success: true };
}

async function setArchived(
  orgSlug: string,
  priorityId: string,
  archivedAt: Date | null,
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManagePriorities(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage priorities",
    };
  }

  const { count } = await db.priority.updateMany({
    where: { id: priorityId, organizationId: membership.organization.id },
    data: { archivedAt },
  });
  if (count === 0) return { success: false, error: "Priority not found" };

  revalidatePath(`/org/${orgSlug}/settings/priorities`);
  return { success: true };
}

export async function archivePriority(
  orgSlug: string,
  priorityId: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, priorityId, new Date());
}

export async function restorePriority(
  orgSlug: string,
  priorityId: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, priorityId, null);
}

/** Marks one priority as the default a new Item starts at, and unmarks
 * every other priority in the organisation — kept atomic via a
 * transaction, mirroring setDefaultStatus. */
export async function setDefaultPriority(
  orgSlug: string,
  priorityId: string,
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManagePriorities(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage priorities",
    };
  }

  const target = await db.priority.findFirst({
    where: { id: priorityId, organizationId: membership.organization.id },
  });
  if (!target) return { success: false, error: "Priority not found" };

  await db.$transaction([
    db.priority.updateMany({
      where: { organizationId: membership.organization.id },
      data: { isDefault: false },
    }),
    db.priority.update({
      where: { id: target.id },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath(`/org/${orgSlug}/settings/priorities`);
  return { success: true };
}
