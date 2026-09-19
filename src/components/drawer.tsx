"use client";

import { useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

/**
 * The right-hand drawer chrome: a fixed header over a scrolling body. Shared
 * by the route drawers (`RouteModal`) and by drawers opened from state on a
 * page (editing an item, recording a decision).
 */
export function Drawer({
  open,
  onOpenChange,
  onOpenChangeComplete,
  title,
  description,
  subheader,
  headerAction,
  titleClassName,
  size = "md",
  children,
}: Pick<
  ComponentProps<typeof Sheet>,
  "open" | "onOpenChange" | "onOpenChangeComplete"
> & {
  title: string;
  description?: string;
  /** Anything that belongs under the title in the fixed header (badges, a byline). */
  subheader?: React.ReactNode;
  /** A control at the header's top right, beside the close button. */
  headerAction?: React.ReactNode;
  titleClassName?: string;
  size?: "md" | "lg" | "xl";
  children: React.ReactNode;
}) {
  // Focus lands on the panel itself, not on whichever control comes first (which
  // would show a focus ring on "Open page" every time a link opens the drawer).
  const popupRef = useRef<HTMLDivElement>(null);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <SheetContent
        ref={popupRef}
        initialFocus={popupRef}
        side="right"
        className={cn(
          "gap-0 overflow-hidden",
          // Below sm the sheet's own 3/4 width is too narrow to read in.
          "max-sm:data-[side=right]:w-full",
          // Sheet caps its width with `data-[side=right]:sm:max-w-sm`; a plain
          // `sm:max-w-*` loses to it, so the override needs the same prefix.
          size === "lg" && "data-[side=right]:sm:max-w-lg",
          size === "xl" && "data-[side=right]:sm:max-w-2xl",
        )}
      >
        <SheetHeader
          className={cn(
            "relative shrink-0 gap-1.5 border-b pr-12",
            headerAction && "pr-36",
          )}
        >
          <SheetTitle className={titleClassName}>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
          {subheader}
          {headerAction ? (
            <>
              <div className="absolute top-3.5 right-14 flex h-7 items-center">
                {headerAction}
              </div>
              {/* Centred in the gap between the action and the close button. */}
              <span
                aria-hidden="true"
                className="bg-border-strong absolute top-4 right-12 h-5 w-px"
              />
            </>
          ) : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
