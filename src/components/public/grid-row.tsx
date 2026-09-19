"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * A grid row that opens its item on click. The title inside is a real link, so
 * keyboard, middle-click and "open in a new tab" all work; this only makes the rest of
 * the row a bigger target. Clicking a control inside the row (the vote chip) does
 * that control's job, not this. While the item's drawer is open its row stays
 * marked, so you can see where you are in the list.
 */
export function GridRow({
  href,
  itemSlug,
  children,
}: {
  href: string;
  itemSlug: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const selected = useSearchParams().get("item") === itemSlug;

  return (
    <tr
      data-selected={selected || undefined}
      aria-current={selected ? "true" : undefined}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a, button, input, select")) {
          return;
        }
        if (event.metaKey || event.ctrlKey) {
          window.open(href, "_blank");
          return;
        }
        router.push(href, { scroll: false });
      }}
      className={cn(
        "cursor-pointer border-b transition-colors last:border-b-0",
        "hover:bg-muted/60 data-[selected]:bg-primary-soft",
      )}
    >
      {children}
    </tr>
  );
}
