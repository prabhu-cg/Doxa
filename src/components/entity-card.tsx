import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Cards sit side by side and wrap as the viewport widens, instead of
 * stacking in one column. */
export function EntityGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** One icon + value pair in a card's metadata row. */
export function EntityMeta({
  icon: Icon,
  children,
  className,
}: {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {children}
    </span>
  );
}

/**
 * The shared shell for Space, Board and Item cards: badges, title, subtitle,
 * description, a metadata row, tags and a footer line, top to bottom. The
 * whole card is one click target (the title link is stretched over it), and
 * the footer is pinned to the bottom so cards in the same grid row line up.
 */
export function EntityCard({
  href,
  title,
  badges,
  subtitle,
  description,
  meta,
  tags,
  footer,
}: {
  href: string;
  title: string;
  badges?: ReactNode;
  subtitle?: ReactNode;
  description?: string | null;
  meta?: ReactNode;
  tags?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article className="group rounded-card bg-surface-raised shadow-card hover:border-primary hover:shadow-raised has-focus-visible:ring-ring/50 relative flex flex-col border p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 has-focus-visible:ring-3">
      {badges ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">{badges}</div>
      ) : null}

      <h3 className="text-base leading-snug font-semibold">
        <Link
          href={href}
          className="outline-none after:absolute after:inset-0 after:content-['']"
        >
          {title}
        </Link>
      </h3>
      {subtitle ? (
        <p className="text-muted-foreground mt-0.5 truncate text-sm">
          {subtitle}
        </p>
      ) : null}

      {description ? (
        <p className="text-muted-foreground mt-3 line-clamp-3 text-sm">
          {description}
        </p>
      ) : null}

      {meta ? (
        <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          {meta}
        </div>
      ) : null}

      {tags ? <div className="mt-3 flex flex-wrap gap-1.5">{tags}</div> : null}

      {footer ? (
        <div className="mt-auto pt-4">
          <div className="text-muted-foreground border-t pt-3 text-xs">
            {footer}
          </div>
        </div>
      ) : null}
    </article>
  );
}
