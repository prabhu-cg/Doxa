"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { categorySchema } from "./schema";
import { generateUniqueCategorySlug } from "./slug";
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

  const slug = await generateUniqueCategorySlug(
    membership.organization.id,
    parsed.data.name,
  );

  await db.category.create({
    data: {
      organizationId: membership.organization.id,
      name: parsed.data.name,
      slug,
    },
  });

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
