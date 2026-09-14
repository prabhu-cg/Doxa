"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/actions";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NotificationType =
  "ITEM_COMMENT" | "COMMENT_REPLY" | "ITEM_STATUS_CHANGED" | "MENTION";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  actorName: string | null;
  itemTitle: string | null;
  href: string | null;
  data: Record<string, unknown>;
  readAt: Date | null;
  createdAt: Date;
};

function messageFor(n: NotificationItem): string {
  const actor = n.actorName ?? "Someone";
  const title = n.itemTitle ?? "an item";
  switch (n.type) {
    case "ITEM_COMMENT":
      return `${actor} commented on "${title}"`;
    case "COMMENT_REPLY":
      return `${actor} replied to your comment on "${title}"`;
    case "ITEM_STATUS_CHANGED":
      return `"${title}" changed from ${n.data.fromStatus} to ${n.data.toStatus}`;
    case "MENTION":
      return `${actor} mentioned you on "${title}"`;
  }
}

export function NotificationBell({
  orgSlug,
  notifications,
  initialUnreadCount,
}: {
  orgSlug: string;
  notifications: NotificationItem[];
  initialUnreadCount: number;
}) {
  const [items, setItems] = useState(notifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [, startTransition] = useTransition();

  function handleOpenNotification(notification: NotificationItem) {
    if (notification.readAt) return;
    setItems((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, readAt: new Date() } : n,
      ),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    startTransition(() => {
      void markNotificationRead(orgSlug, notification.id);
    });
  }

  function handleMarkAllRead() {
    const now = new Date();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
    setUnreadCount(0);
    startTransition(() => {
      void markAllNotificationsRead(orgSlug);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="focus-visible:ring-ring/50 relative rounded-full p-1.5 outline-none focus-visible:ring-3"
            aria-label={
              unreadCount > 0
                ? `Notifications (${unreadCount} unread)`
                : "Notifications"
            }
          >
            <Bell className="size-5" />
            {unreadCount > 0 ? (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            ) : null}
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="text-muted-foreground px-2 py-3 text-sm">
            No notifications yet.
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {items.map((notification) => (
              <li key={notification.id}>
                <Link
                  href={notification.href ?? `/org/${orgSlug}`}
                  onClick={() => handleOpenNotification(notification)}
                  className={`hover:bg-accent block px-2 py-2 text-sm ${
                    notification.readAt ? "" : "bg-accent/40 font-medium"
                  }`}
                >
                  <p>{messageFor(notification)}</p>
                  <p className="text-muted-foreground text-xs font-normal">
                    {new Date(notification.createdAt).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
