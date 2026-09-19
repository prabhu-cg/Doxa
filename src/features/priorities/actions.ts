"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import {
  NAME_RACE_MESSAGE,
  nameTakenMessage,
  restoreBlockedMessage,
} from "@/lib/names";
import { insertOrNull } from "@/server/db-errors";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { prioritySchema } from "./schema";
import { generateUniquePrioritySlug } from "./slug";
import { isPriorityNameTaken } from "./queries";
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

  if (await isPriorityNameTaken(membership.organization.id, parsed.data.name)) {
    return {
      success: false,
      error: nameTakenMessage("priority", parsed.data.name),
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

  const created = await insertOrNull(() =>
    db.priority.create({
      data: {
        organizationId: membership.organization.id,
        name: parsed.data.name,
        color: parsed.data.color,
        slug,
        sortOrder: (highest?.sortOrder ?? -1) + 1,
      },
    }),
  );
  if (!created) return { success: false, error: NAME_RACE_MESSAGE };

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

  if (
    await isPriorityNameTaken(
      membership.organization.id,
      parsed.data.name,
      priorityId,
    )
  ) {
    return {
      success: false,
      error: nameTakenMessage("priority", parsed.data.name),
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

  if (archivedAt === null) {
    const current = await db.priority.findFirst({
      where: { id: priorityId, organizationId: membership.organization.id },
      select: { name: true },
    });
    if (!current) return { success: false, error: "Priority not found" };
    if (
      await isPriorityNameTaken(
        membership.organization.id,
        current.name,
        priorityId,
      )
    ) {
      return {
        success: false,
        error: restoreBlockedMessage("priority", current.name),
      };
    }
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
