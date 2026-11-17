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
          // Sheet caps its width with `data-[side=right]:sm:max-w-md`; a plain
          // `sm:max-w-*` loses to it, so the override needs the same prefix.
          size === "lg" && "data-[side=right]:sm:max-w-xl",
          size === "xl" && "data-[side=right]:sm:max-w-3xl",
        )}
      >
        <SheetHeader
          className={cn(
            "bg-surface relative shrink-0 gap-1.5 border-b px-5 py-5 pr-16 sm:px-8 sm:py-6 sm:pr-20",
            headerAction && "pr-44 sm:pr-48",
          )}
        >
          <SheetTitle className={titleClassName}>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
          {subheader}
          {headerAction ? (
            <>
              <div className="absolute top-5 right-16 flex h-9 items-center sm:top-6 sm:right-20">
                {headerAction}
              </div>
              {/* Centred in the gap between the action and the close button. */}
              <span
                aria-hidden="true"
                className="bg-border-strong absolute top-7 right-[3.6rem] h-5 w-px sm:top-8 sm:right-[4.6rem]"
              />
            </>
          ) : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
