"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** The public site's tabs: one per public board, then the roadmap. The current
 * tab is read from the URL, so it is right inside an open drawer too. */
export function PublicNav({
  tabs,
  className,
}: {
  tabs: { href: string; label: string }[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Sections"
      className={cn("flex items-center gap-1", className)}
    >
      {tabs.map((tab) => {
        const current =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors",
              current
                ? "bg-primary-soft text-primary-text"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
