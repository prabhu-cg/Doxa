"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { reorderExpected } from "@/lib/vote-reorder";
import { useItemDrawer } from "./item-drawer";

/**
 * A grid row that opens its item on click. The title inside is a real link, so
 * keyboard, middle-click and "open in a new tab" all work; this only makes the rest of
 * the row a bigger target. Clicking a control inside the row (the vote chip) does
 * that control's job, not this. A plain click on the row or its title opens the
 * drawer straight away (`ItemDrawerHost`), and while it is open the row stays
 * marked, so you can see where you are in the list.
 *
 * After a vote re-sorts a "Most voted" board, the row glides from its old place
 * to its new rank.
 */
export function GridRow({
  href,
  itemSlug,
  itemTitle,
  children,
}: {
  href: string;
  itemSlug: string;
  itemTitle: string;
  children: React.ReactNode;
}) {
  const { activeSlug, openItem } = useItemDrawer();
  const selected = activeSlug === itemSlug;
  const ref = useRef<HTMLTableRowElement>(null);
  const lastTop = useRef<number | null>(null);

  // FLIP: remember where the row was, and if a vote moved it, start it there
  // and let it settle into its new place.
  useLayoutEffect(() => {
    const row = ref.current;
    if (!row) return;
    const top = row.offsetTop;
    const previous = lastTop.current;
    lastTop.current = top;
    if (previous === null || previous === top || !reorderExpected()) return;
    row.animate(
      [{ transform: `translateY(${previous - top}px)` }, { transform: "none" }],
      { duration: 380, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  });

  function open() {
    openItem({ slug: itemSlug, title: itemTitle, href });
  }

  return (
    <tr
      ref={ref}
      data-selected={selected || undefined}
      aria-current={selected ? "true" : undefined}
      onClickCapture={(event) => {
        // The title link, clicked plainly, opens the drawer the same way;
        // modified clicks keep the link's own behaviour (new tab, new window).
        const link = (event.target as HTMLElement).closest("a[data-row-title]");
        if (
          !link ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        open();
      }}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a, button, input, select")) {
          return;
        }
        if (event.metaKey || event.ctrlKey) {
          window.open(href, "_blank");
          return;
        }
        open();
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
