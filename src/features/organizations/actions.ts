"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireAuthenticatedSupabaseUser } from "@/features/auth/queries";
import { requireCurrentProfile } from "@/features/profile/queries";
import { countOwners, requireOrganizationMembership } from "./queries";
import {
  createOrganizationSchema,
  onboardingSchema,
  updateOrganizationSchema,
} from "./schema";
import { generateUniqueOrganizationSlug } from "./slug";
import { canLeaveOrganization, canUpdateOrganization } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createOrganization(input: {
  name: string;
}): Promise<ActionResult & { slug?: string }> {
  const profile = await requireCurrentProfile();

  const parsed = createOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueOrganizationSlug(parsed.data.name);

  await db.organization.create({
    data: {
      name: parsed.data.name,
      slug,
      memberships: {
        create: { userId: profile.id, role: "OWNER" },
      },
    },
  });

  return { success: true, slug };
}

/**
 * The single-step onboarding flow: set the user's display name (their
 * Profile row already exists, created by the signup trigger) and create
 * their first organisation, together.
 */
export async function completeOnboarding(input: {
  displayName: string;
  organizationName: string;
}): Promise<ActionResult & { slug?: string }> {
  const user = await requireAuthenticatedSupabaseUser();

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueOrganizationSlug(
    parsed.data.organizationName,
  );

  await db.$transaction([
    db.profile.update({
      where: { id: user.id },
      data: { displayName: parsed.data.displayName },
    }),
    db.organization.create({
      data: {
        name: parsed.data.organizationName,
        slug,
        memberships: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    }),
  ]);

  return { success: true, slug };
}

export async function updateOrganization(
  slug: string,
  input: { name: string },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(slug);

  if (!canUpdateOrganization(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can update organisation settings",
    };
  }

  const parsed = updateOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  await db.organization.update({
    where: { id: membership.organization.id },
    data: { name: parsed.data.name },
  });

  revalidatePath(`/org/${slug}`);
  revalidatePath(`/org/${slug}/settings`);
  return { success: true };
}

export async function leaveOrganization(slug: string): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(slug);
  const ownerCount = await countOwners(membership.organization.id);

  if (!canLeaveOrganization(membership.role, ownerCount)) {
    return {
      success: false,
      error: "You're the only owner — promote someone else to owner first",
    };
  }

  await db.membership.delete({ where: { id: membership.id } });
  redirect("/app");
}
