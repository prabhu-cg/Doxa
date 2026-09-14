"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireOrganizationMembership } from "@/features/organizations/queries";

type ActionResult = { success: true } | { success: false; error: string };

export async function markNotificationRead(
  orgSlug: string,
  notificationId: string,
): Promise<ActionResult> {
  const { profile, membership } = await requireOrganizationMembership(orgSlug);

  await db.notification.updateMany({
    where: {
      id: notificationId,
      organizationId: membership.organization.id,
      userId: profile.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath(`/org/${orgSlug}`, "layout");
  return { success: true };
}

export async function markAllNotificationsRead(
  orgSlug: string,
): Promise<ActionResult> {
  const { profile, membership } = await requireOrganizationMembership(orgSlug);

  await db.notification.updateMany({
    where: {
      organizationId: membership.organization.id,
      userId: profile.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath(`/org/${orgSlug}`, "layout");
  return { success: true };
}
