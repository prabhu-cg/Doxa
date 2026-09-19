import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  /** Omit on the last item — it's the page you're already on. */
  href?: string;
};

/**
 * The trail from a top-level section down to the current page, so a drilled-
 * down page (an item, a board's settings…) always has a way back up to each
 * of its parents. The last item is the current page and isn't a link.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li
              key={`${index}-${item.label}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index > 0 ? (
                <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              ) : null}
              {isCurrent || !item.href ? (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  title={item.label}
                  className={cn(
                    "max-w-56 truncate sm:max-w-72",
                    isCurrent && "text-foreground font-medium",
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  title={item.label}
                  className="hover:text-foreground focus-visible:ring-ring/50 max-w-56 truncate rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 sm:max-w-72"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
