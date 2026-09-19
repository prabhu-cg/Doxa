"use client";

import type { ComponentProps } from "react";
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
  size = "md",
  children,
}: Pick<
  ComponentProps<typeof Sheet>,
  "open" | "onOpenChange" | "onOpenChangeComplete"
> & {
  title: string;
  description?: string;
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <SheetContent
        side="right"
        className={cn(
          "gap-0 overflow-hidden",
          // Sheet caps its width with `data-[side=right]:sm:max-w-sm`; a plain
          // `sm:max-w-*` loses to it, so the override needs the same prefix.
          size === "lg" && "data-[side=right]:sm:max-w-lg",
        )}
      >
        <SheetHeader className="shrink-0 border-b pr-12">
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
