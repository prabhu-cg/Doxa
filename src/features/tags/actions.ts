"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { generateUniqueSlug, slugify } from "@/lib/slug";
import { tagSchema } from "./schema";
import { canManageTags } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createTag(
  orgSlug: string,
  input: { name: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageTags(membership.role)) {
    return { success: false, error: "Only owners and admins can manage tags" };
  }

  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueSlug(
    slugify(parsed.data.name),
    async (candidate) => {
      const existing = await db.tag.findUnique({
        where: {
          organizationId_slug: {
            organizationId: membership.organization.id,
            slug: candidate,
          },
        },
      });
      return existing !== null;
    },
  );

  await db.tag.create({
    data: {
      organizationId: membership.organization.id,
      name: parsed.data.name,
      slug,
    },
  });

  revalidatePath(`/org/${orgSlug}/settings/tags`);
  return { success: true };
}

export async function updateTag(
  orgSlug: string,
  tagId: string,
  input: { name: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageTags(membership.role)) {
    return { success: false, error: "Only owners and admins can manage tags" };
  }

  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { count } = await db.tag.updateMany({
    where: { id: tagId, organizationId: membership.organization.id },
    data: { name: parsed.data.name },
  });
  if (count === 0) return { success: false, error: "Tag not found" };

  revalidatePath(`/org/${orgSlug}/settings/tags`);
  return { success: true };
}

export async function deleteTag(
  orgSlug: string,
  tagId: string,
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageTags(membership.role)) {
    return { success: false, error: "Only owners and admins can manage tags" };
  }

  const { count } = await db.tag.deleteMany({
    where: { id: tagId, organizationId: membership.organization.id },
  });
  if (count === 0) return { success: false, error: "Tag not found" };

  revalidatePath(`/org/${orgSlug}/settings/tags`);
  return { success: true };
}
