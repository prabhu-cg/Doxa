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
  updateOrganizationBrandingSchema,
  updateOrganizationSchema,
  updateOrganizationTerminologySchema,
} from "./schema";
import { generateUniqueOrganizationSlug } from "./slug";
import {
  canChangeMemberRole,
  canLeaveOrganization,
  canRemoveMember,
  canUpdateOrganization,
} from "./permissions";
import { DEFAULT_ITEM_TYPES } from "@/features/item-types/defaults";
import { DEFAULT_STATUSES } from "@/features/statuses/defaults";
import { DEFAULT_PRIORITIES } from "@/features/priorities/defaults";
import {
  canCreateOrganizationForUser,
  hasFeature,
} from "@/features/entitlements/queries";
import { getPlanByKey } from "@/features/billing/queries";
import { logAuditEvent } from "@/features/audit-log/log";
import type { MembershipRole } from "@/generated/prisma/client";

type ActionResult = { success: true } | { success: false; error: string };

async function requireFreePlanId(): Promise<string> {
  const freePlan = await getPlanByKey("FREE");
  if (!freePlan) {
    throw new Error("FREE plan is not seeded — run the Phase 5 migration/seed");
  }
  return freePlan.id;
}

export async function createOrganization(input: {
  name: string;
}): Promise<ActionResult & { slug?: string }> {
  const profile = await requireCurrentProfile();

  const limitCheck = await canCreateOrganizationForUser(profile.id);
  if (!limitCheck.allowed) {
    return {
      success: false,
      error: `You've reached the Free plan's limit of ${limitCheck.limit} organisation${limitCheck.limit === 1 ? "" : "s"}. Upgrade an existing organisation to create more.`,
    };
  }

  const parsed = createOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueOrganizationSlug(parsed.data.name);
  const freePlanId = await requireFreePlanId();

  const organization = await db.organization.create({
    data: {
      name: parsed.data.name,
      slug,
      memberships: {
        create: { userId: profile.id, role: "OWNER" },
      },
      itemTypes: { create: DEFAULT_ITEM_TYPES },
      statuses: { create: DEFAULT_STATUSES },
      priorities: { create: DEFAULT_PRIORITIES },
    },
  });
  const customer = await db.customer.create({
    data: { organizationId: organization.id },
  });
  await db.subscription.create({
    data: {
      organizationId: organization.id,
      customerId: customer.id,
      planId: freePlanId,
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

  // A brand-new user has no memberships yet, so this always allows —
  // checked anyway so onboarding and createOrganization enforce the same
  // rule through the same code path.
  const limitCheck = await canCreateOrganizationForUser(user.id);
  if (!limitCheck.allowed) {
    return {
      success: false,
      error: `You've reached the Free plan's limit of ${limitCheck.limit} organisation${limitCheck.limit === 1 ? "" : "s"}.`,
    };
  }

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
  const freePlanId = await requireFreePlanId();

  const organization = await db.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: user.id },
      data: { displayName: parsed.data.displayName },
    });
    const created = await tx.organization.create({
      data: {
        name: parsed.data.organizationName,
        slug,
        memberships: {
          create: { userId: user.id, role: "OWNER" },
        },
        itemTypes: { create: DEFAULT_ITEM_TYPES },
        statuses: { create: DEFAULT_STATUSES },
        priorities: { create: DEFAULT_PRIORITIES },
      },
    });
    const customer = await tx.customer.create({
      data: { organizationId: created.id },
    });
    await tx.subscription.create({
      data: {
        organizationId: created.id,
        customerId: customer.id,
        planId: freePlanId,
      },
    });
    return created;
  });

  return { success: true, slug: organization.slug };
}

export async function updateOrganization(
  slug: string,
  input: { name: string },
): Promise<ActionResult> {
  const { profile, membership } = await requireOrganizationMembership(slug);

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

  const previousName = membership.organization.name;

  await db.$transaction([
    db.organization.update({
      where: { id: membership.organization.id },
      data: { name: parsed.data.name },
    }),
    logAuditEvent(db, {
      organizationId: membership.organization.id,
      actorId: profile.id,
      action: "ORGANIZATION_UPDATED",
      data: { field: "name", from: previousName, to: parsed.data.name },
    }),
  ]);

  revalidatePath(`/org/${slug}`);
  revalidatePath(`/org/${slug}/settings`);
  return { success: true };
}

/**
 * Logo/accent colour. Gated behind the `branding` Plan entitlement — but
 * only when actually setting a non-default value; clearing branding back
 * to nothing is always allowed (so a downgraded organisation can still
 * remove branding it can no longer add), matching the "the column always
 * accepts a value so a downgraded org doesn't lose data" note in
 * prisma/schema.prisma (clearing is a different, always-safe operation
 * from setting).
 */
export async function updateOrganizationBranding(
  slug: string,
  input: { logoUrl?: string; accentColor?: string },
): Promise<ActionResult> {
  const { profile, membership } = await requireOrganizationMembership(slug);
  if (!canUpdateOrganization(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can update branding",
    };
  }

  const parsed = updateOrganizationBrandingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const isSettingSomething = !!parsed.data.logoUrl || !!parsed.data.accentColor;
  if (isSettingSomething) {
    const canBrand = await hasFeature(membership.organization.id, "branding");
    if (!canBrand) {
      return {
        success: false,
        error: "Custom branding requires the Pro plan or higher",
      };
    }
  }

  await db.$transaction([
    db.organization.update({
      where: { id: membership.organization.id },
      data: {
        logoUrl: parsed.data.logoUrl ?? null,
        accentColor: parsed.data.accentColor ?? null,
      },
    }),
    logAuditEvent(db, {
      organizationId: membership.organization.id,
      actorId: profile.id,
      action: "BRANDING_UPDATED",
      data: {
        hasLogo: !!parsed.data.logoUrl,
        hasAccentColor: !!parsed.data.accentColor,
      },
    }),
  ]);

  revalidatePath(`/org/${slug}/settings/branding`);
  revalidatePath(`/b/${slug}`);
  return { success: true };
}

/** What this organisation calls an Item — a free, ungated feature (not
 * part of the `branding` entitlement bullet in docs/architecture.md's
 * Phase 5 note), since it's organisational configuration rather than
 * visual branding. */
export async function updateOrganizationTerminology(
  slug: string,
  input: { itemTerminologySingular: string; itemTerminologyPlural: string },
): Promise<ActionResult> {
  const { profile, membership } = await requireOrganizationMembership(slug);
  if (!canUpdateOrganization(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can update terminology",
    };
  }

  const parsed = updateOrganizationTerminologySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  await db.$transaction([
    db.organization.update({
      where: { id: membership.organization.id },
      data: {
        itemTerminologySingular: parsed.data.itemTerminologySingular,
        itemTerminologyPlural: parsed.data.itemTerminologyPlural,
      },
    }),
    logAuditEvent(db, {
      organizationId: membership.organization.id,
      actorId: profile.id,
      action: "ORGANIZATION_UPDATED",
      data: { field: "terminology" },
    }),
  ]);

  revalidatePath(`/org/${slug}/settings/branding`);
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

/** Basic moderation: an admin+ removes another member from the
 * organisation entirely (not just from one board). See canRemoveMember
 * for who can remove whom. */
export async function removeMember(
  slug: string,
  membershipId: string,
): Promise<ActionResult> {
  const { profile, membership } = await requireOrganizationMembership(slug);
  const organizationId = membership.organization.id;

  const target = await db.membership.findFirst({
    where: { id: membershipId, organizationId },
  });
  if (!target) {
    return {
      success: false,
      error: "That member is no longer in this organisation",
    };
  }
  if (target.userId === profile.id) {
    return {
      success: false,
      error: 'Use "Leave organisation" to remove yourself',
    };
  }

  const ownerCount = await countOwners(organizationId);
  if (!canRemoveMember(membership.role, target.role, ownerCount)) {
    return {
      success: false,
      error: "You don't have permission to remove this member",
    };
  }

  await db.$transaction([
    db.membership.delete({ where: { id: target.id } }),
    logAuditEvent(db, {
      organizationId,
      actorId: profile.id,
      action: "MEMBER_REMOVED",
      targetType: "Membership",
      targetId: target.id,
      data: { removedRole: target.role },
    }),
  ]);

  revalidatePath(`/org/${slug}/settings`);
  return { success: true };
}

/** Promotes or demotes a member. See canChangeMemberRole for who can
 * change whom to what. */
export async function changeMemberRole(
  slug: string,
  membershipId: string,
  newRole: MembershipRole,
): Promise<ActionResult> {
  const { profile, membership } = await requireOrganizationMembership(slug);
  const organizationId = membership.organization.id;

  const target = await db.membership.findFirst({
    where: { id: membershipId, organizationId },
  });
  if (!target) {
    return {
      success: false,
      error: "That member is no longer in this organisation",
    };
  }
  if (target.userId === profile.id) {
    return {
      success: false,
      error: "You can't change your own role",
    };
  }

  const ownerCount = await countOwners(organizationId);
  if (!canChangeMemberRole(membership.role, target.role, newRole, ownerCount)) {
    return {
      success: false,
      error: "You don't have permission to make that change",
    };
  }

  await db.$transaction([
    db.membership.update({ where: { id: target.id }, data: { role: newRole } }),
    logAuditEvent(db, {
      organizationId,
      actorId: profile.id,
      action: "MEMBER_ROLE_CHANGED",
      targetType: "Membership",
      targetId: target.id,
      data: { fromRole: target.role, toRole: newRole },
    }),
  ]);

  revalidatePath(`/org/${slug}/settings`);
  return { success: true };
}
