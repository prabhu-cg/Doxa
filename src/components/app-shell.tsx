"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { DoxaLogo } from "@/components/doxa-logo";
import { OrgSwitcher } from "@/components/org-switcher";
import { UserMenu } from "@/components/user-menu";
import {
  NotificationBell,
  type NotificationItem,
} from "@/components/notification-bell";
import { OrgSidebarNav } from "@/components/org-sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type OrgOption = { slug: string; name: string };

export function AppShell({
  currentOrganization,
  organizations,
  displayName,
  username,
  showPrioritisation,
  notifications,
  unreadNotificationCount,
  modal,
  children,
}: {
  currentOrganization: OrgOption;
  organizations: OrgOption[];
  displayName: string;
  username: string | null;
  showPrioritisation: boolean;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  modal?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-dvh">
      <aside className="bg-sidebar hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/app" aria-label="Doxa home">
            <DoxaLogo />
          </Link>
        </div>
        <div className="border-b p-3">
          <OrgSwitcher
            current={currentOrganization}
            options={organizations}
            className="max-w-none"
          />
        </div>
        <OrgSidebarNav
          orgSlug={currentOrganization.slug}
          showPrioritisation={showPrioritisation}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/85 sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <Link href="/app" aria-label="Doxa home">
              <DoxaLogo showWordmark={false} />
            </Link>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-1">
            <NotificationBell
              orgSlug={currentOrganization.slug}
              notifications={notifications}
              initialUnreadCount={unreadNotificationCount}
            />
            <UserMenu displayName={displayName} username={username} />
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-14 items-center border-b px-4">
            <DoxaLogo />
          </div>
          <div className="border-b p-3">
            <OrgSwitcher
              current={currentOrganization}
              options={organizations}
              className="max-w-none"
            />
          </div>
          <div onClick={() => setMobileNavOpen(false)} className="flex-1">
            <OrgSidebarNav
              orgSlug={currentOrganization.slug}
              showPrioritisation={showPrioritisation}
            />
          </div>
        </SheetContent>
      </Sheet>

      {modal}
    </div>
  );
}
