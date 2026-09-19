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
import { isSpaceNameTaken, requireSpaceForOrgMember } from "./queries";
import { createSpaceSchema, updateSpaceSchema } from "./schema";
import { generateUniqueSpaceSlug } from "./slug";
import { canManageSpaces } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createSpace(
  orgSlug: string,
  input: { name: string; description?: string },
): Promise<ActionResult & { slug?: string }> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageSpaces(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can create spaces",
    };
  }

  const parsed = createSpaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (await isSpaceNameTaken(membership.organization.id, parsed.data.name)) {
    return {
      success: false,
      error: nameTakenMessage("space", parsed.data.name),
    };
  }

  const slug = await generateUniqueSpaceSlug(
    membership.organization.id,
    parsed.data.name,
  );

  const created = await insertOrNull(() =>
    db.space.create({
      data: {
        organizationId: membership.organization.id,
        name: parsed.data.name,
        description: parsed.data.description,
        slug,
      },
    }),
  );
  if (!created) return { success: false, error: NAME_RACE_MESSAGE };

  revalidatePath(`/org/${orgSlug}/spaces`);
  return { success: true, slug };
}

export async function updateSpace(
  orgSlug: string,
  spaceSlug: string,
  input: { name: string; description?: string },
): Promise<ActionResult> {
  const { membership, space } = await requireSpaceForOrgMember(
    orgSlug,
    spaceSlug,
  );
  if (!canManageSpaces(membership.role)) {
    return { success: false, error: "Only owners and admins can edit spaces" };
  }

  const parsed = updateSpaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (
    await isSpaceNameTaken(
      membership.organization.id,
      parsed.data.name,
      space.id,
    )
  ) {
    return {
      success: false,
      error: nameTakenMessage("space", parsed.data.name),
    };
  }

  await db.space.update({
    where: { id: space.id },
    data: { name: parsed.data.name, description: parsed.data.description },
  });

  revalidatePath(`/org/${orgSlug}/spaces/${spaceSlug}`);
  return { success: true };
}

export async function archiveSpace(
  orgSlug: string,
  spaceSlug: string,
): Promise<ActionResult> {
  const { membership, space } = await requireSpaceForOrgMember(
    orgSlug,
    spaceSlug,
  );
  if (!canManageSpaces(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can archive spaces",
    };
  }

  await db.space.update({
    where: { id: space.id },
    data: { archivedAt: new Date() },
  });

  revalidatePath(`/org/${orgSlug}/spaces`);
  revalidatePath(`/org/${orgSlug}/spaces/${spaceSlug}`);
  return { success: true };
}

export async function restoreSpace(
  orgSlug: string,
  spaceSlug: string,
): Promise<ActionResult> {
  const { membership, space } = await requireSpaceForOrgMember(
    orgSlug,
    spaceSlug,
  );
  if (!canManageSpaces(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can restore spaces",
    };
  }

  if (
    await isSpaceNameTaken(membership.organization.id, space.name, space.id)
  ) {
    return {
      success: false,
      error: restoreBlockedMessage("space", space.name),
    };
  }

  await db.space.update({
    where: { id: space.id },
    data: { archivedAt: null },
  });

  revalidatePath(`/org/${orgSlug}/spaces`);
  revalidatePath(`/org/${orgSlug}/spaces/${spaceSlug}`);
  return { success: true };
}
