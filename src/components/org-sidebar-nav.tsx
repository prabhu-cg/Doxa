"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KanbanSquare,
  FolderKanban,
  Map,
  ListOrdered,
  HelpCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function OrgSidebarNav({
  orgSlug,
  showPrioritisation,
}: {
  orgSlug: string;
  showPrioritisation: boolean;
}) {
  const pathname = usePathname();
  const base = `/org/${orgSlug}`;

  const items: NavItem[] = [
    { href: `${base}/spaces`, label: "Spaces", icon: FolderKanban },
    { href: `${base}/boards`, label: "Boards", icon: KanbanSquare },
    { href: `${base}/roadmap`, label: "Roadmap", icon: Map },
    ...(showPrioritisation
      ? [
          {
            href: `${base}/prioritization`,
            label: "Prioritisation",
            icon: ListOrdered,
          },
        ]
      : []),
  ];

  const footerItems: NavItem[] = [
    { href: `${base}/help`, label: "Help", icon: HelpCircle },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];

  // A link to `/org/slug/boards` should still read as active on
  // `/org/slug/boards/main/settings`, so match the item and everything
  // nested under it.
  function isActive(item: NavItem): boolean {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  function renderItem(item: NavItem) {
    const Icon = item.icon;
    const active = isActive(item);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "rounded-control flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-primary-soft text-primary-text"
              : "text-muted-foreground hover:bg-primary-soft hover:text-primary-text",
          )}
        >
          <Icon className="size-4 shrink-0" />
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <nav className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-2">
      <ul className="space-y-1">{items.map(renderItem)}</ul>
      <ul className="space-y-1 border-t pt-2">{footerItems.map(renderItem)}</ul>
    </nav>
  );
}
