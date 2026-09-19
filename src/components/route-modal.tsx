"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

/**
 * The `<Modal>` wrapper from Next.js's own intercepted-route pattern
 * (parallel `@modal` slot + `(.)segment` intercepting routes — see
 * `src/app/org/[slug]/@modal/`), adapted to render as our existing Sheet
 * drawer instead of a hand-rolled dialog.
 *
 * The intercepted page is mounted the moment the URL matches, so the Sheet
 * starts closed and opens in an effect — a Sheet that mounts already open
 * has no "closed" state to transition from and would just appear. Closing
 * (Escape, backdrop click, or the X) plays the slide-out first and only
 * then calls `router.back()`, which is what actually removes the
 * intercepted route and reveals the real page underneath.
 */
export function RouteModal({
  title,
  description,
  size = "md",
  children,
}: {
  title: string;
  description?: string;
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closing = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) closing.current = true;
        setOpen(next);
      }}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen && closing.current) router.back();
      }}
    >
      <SheetContent
        side="right"
        className={cn(
          "gap-0 overflow-hidden",
          size === "lg" ? "sm:max-w-lg" : "sm:max-w-md",
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
