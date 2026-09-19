"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { NAME_RACE_MESSAGE, nameTakenMessage } from "@/lib/names";
import { insertOrNull } from "@/server/db-errors";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { categorySchema } from "./schema";
import { generateUniqueCategorySlug } from "./slug";
import { isCategoryNameTaken } from "./queries";
import { canManageCategories } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createCategory(
  orgSlug: string,
  input: { name: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageCategories(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage categories",
    };
  }

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (await isCategoryNameTaken(membership.organization.id, parsed.data.name)) {
    return {
      success: false,
      error: nameTakenMessage("category", parsed.data.name),
    };
  }

  const slug = await generateUniqueCategorySlug(
    membership.organization.id,
    parsed.data.name,
  );

  const created = await insertOrNull(() =>
    db.category.create({
      data: {
        organizationId: membership.organization.id,
        name: parsed.data.name,
        slug,
      },
    }),
  );
  if (!created) return { success: false, error: NAME_RACE_MESSAGE };

  revalidatePath(`/org/${orgSlug}/settings/categories`);
  return { success: true };
}

export async function updateCategory(
  orgSlug: string,
  categoryId: string,
  input: { name: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageCategories(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage categories",
    };
  }

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (
    await isCategoryNameTaken(
      membership.organization.id,
      parsed.data.name,
      categoryId,
    )
  ) {
    return {
      success: false,
      error: nameTakenMessage("category", parsed.data.name),
    };
  }

  const { count } = await db.category.updateMany({
    where: { id: categoryId, organizationId: membership.organization.id },
    data: { name: parsed.data.name },
  });
  if (count === 0) return { success: false, error: "Category not found" };

  revalidatePath(`/org/${orgSlug}/settings/categories`);
  return { success: true };
}

export async function deleteCategory(
  orgSlug: string,
  categoryId: string,
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageCategories(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage categories",
    };
  }

  const { count } = await db.category.deleteMany({
    where: { id: categoryId, organizationId: membership.organization.id },
  });
  if (count === 0) return { success: false, error: "Category not found" };

  revalidatePath(`/org/${orgSlug}/settings/categories`);
  return { success: true };
}
