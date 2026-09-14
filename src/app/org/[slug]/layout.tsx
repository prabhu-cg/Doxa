import {
  listMembershipsForUser,
  requireOrganizationMembership,
} from "@/features/organizations/queries";
import {
  countUnreadNotifications,
  listNotificationsForUser,
} from "@/features/notifications/queries";
import { AppShell } from "@/components/app-shell";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { profile, membership } = await requireOrganizationMembership(slug);
  const organizationId = membership.organization.id;

  const [memberships, notifications, unreadNotificationCount] =
    await Promise.all([
      listMembershipsForUser(profile.id),
      listNotificationsForUser(organizationId, profile.id),
      countUnreadNotifications(organizationId, profile.id),
    ]);

  return (
    <AppShell
      currentOrganization={{
        slug: membership.organization.slug,
        name: membership.organization.name,
      }}
      organizations={memberships.map((m) => ({
        slug: m.organization.slug,
        name: m.organization.name,
      }))}
      displayName={profile.displayName}
      notifications={notifications.map((n) => ({
        id: n.id,
        type: n.type,
        actorName: n.actor?.displayName ?? null,
        itemTitle: n.item?.title ?? null,
        href: n.item
          ? `/org/${slug}/boards/${n.item.board.slug}/items/${n.item.slug}`
          : null,
        data: (n.data ?? {}) as Record<string, unknown>,
        readAt: n.readAt,
        createdAt: n.createdAt,
      }))}
      unreadNotificationCount={unreadNotificationCount}
    >
      {children}
    </AppShell>
  );
}
