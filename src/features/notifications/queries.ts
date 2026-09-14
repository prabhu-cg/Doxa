import "server-only";
import { db } from "@/server/db";
import type { Notification, Profile } from "@/generated/prisma/client";

export type NotificationWithContext = Notification & {
  actor: Profile | null;
  item: { slug: string; title: string; board: { slug: string } } | null;
};

export async function listNotificationsForUser(
  organizationId: string,
  userId: string,
  limit = 30,
): Promise<NotificationWithContext[]> {
  return db.notification.findMany({
    where: { organizationId, userId },
    include: {
      actor: true,
      item: {
        select: { slug: true, title: true, board: { select: { slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countUnreadNotifications(
  organizationId: string,
  userId: string,
): Promise<number> {
  return db.notification.count({
    where: { organizationId, userId, readAt: null },
  });
}
