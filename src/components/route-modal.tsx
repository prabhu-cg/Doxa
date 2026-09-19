"use client";

import { useRouter } from "next/navigation";
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
 * drawer instead of a hand-rolled dialog. Closing it (Escape, backdrop
 * click, or the X) calls `router.back()`, which is what actually removes
 * the intercepted route and reveals the real page underneath — this
 * component never manages its own open/closed state, since being
 * mounted at all IS the "open" state (Next only renders the intercepted
 * page while the URL matches it).
 */
export function RouteModal({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="flex-1 px-4 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
