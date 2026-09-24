"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/drawer";
import { Skeleton } from "@/components/ui/skeleton";

type OpenedItem = {
  slug: string;
  title: string;
  subheader: React.ReactNode;
  headerAction: React.ReactNode;
  body: React.ReactNode;
};

type ItemDrawerContext = {
  /** The item whose drawer is open or opening, so its row can show it at once. */
  activeSlug: string | null;
  openItem: (item: { slug: string; title: string; href: string }) => void;
};

const Context = createContext<ItemDrawerContext | null>(null);

export function useItemDrawer() {
  const context = useContext(Context);
  if (!context) throw new Error("useItemDrawer needs an <ItemDrawerHost>");
  return context;
}

const titleClassName =
  "line-clamp-4 text-xl leading-snug font-bold tracking-tight";

/**
 * An item opened from the grid, in a right-hand drawer over the list. The drawer
 * is part of the board's own address (`?item=…`), so it survives a reload, can be
 * shared, and the browser's Back button closes it.
 *
 * The host stays mounted while the address changes, so a click opens the drawer
 * at once with the title the row already knows, and the rest (status, details,
 * discussion) fills in when the server's render of `?item=…` arrives, rather
 * than the drawer waiting for that round trip before it appears. Closing slides
 * it out first, then drops the parameter, leaving the board with the same
 * filters, sort and scroll position it had.
 */
export function ItemDrawerHost({
  item,
  closeHref,
  children,
}: {
  /** The item the server rendered for `?item=…`, or null. */
  item: OpenedItem | null;
  closeHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Opened from a row and not yet rendered by the server.
  const [pending, setPending] = useState<{
    slug: string;
    title: string;
  } | null>(null);
  // Closed by the visitor while the server's copy may still be on its way, so
  // its arrival doesn't open the drawer again.
  const dismissed = useRef<string | null>(null);
  const closing = useRef(false);
  // The item the server last rendered, so a dismissal is forgotten only once
  // that item has come and gone.
  const seen = useRef<string | null>(null);

  const arrived = !!item && item.slug === pending?.slug;
  if (arrived) setPending(null);

  // Back button, or the parameter otherwise gone: close — unless a row has just
  // asked for an item that isn't here yet.
  const [hadItem, setHadItem] = useState(!!item);
  if (hadItem !== !!item) {
    setHadItem(!!item);
    if (!item && !pending && open) setOpen(false);
  }

  useEffect(() => {
    if (!item) {
      if (seen.current && seen.current === dismissed.current) {
        dismissed.current = null;
      }
      seen.current = null;
      return;
    }
    seen.current = item.slug;
    if (item.slug === dismissed.current) {
      // Closed before the server's copy arrived: drop the parameter it brought.
      if (!closing.current) router.replace(closeHref, { scroll: false });
      return;
    }
    if (open) return;
    // Loaded with `?item=…`: a sheet that mounts already open has nothing to
    // slide in from, so it opens on the next frame.
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [item, open, closeHref, router]);

  function openItem(next: { slug: string; title: string; href: string }) {
    dismissed.current = null;
    closing.current = false;
    setPending({ slug: next.slug, title: next.title });
    setOpen(true);
    startTransition(() => router.push(next.href, { scroll: false }));
  }

  const shown = item && (!pending || item.slug === pending.slug) ? item : null;
  const title = shown?.title ?? pending?.title ?? "";
  const activeSlug = open ? (pending?.slug ?? item?.slug ?? null) : null;

  return (
    <Context.Provider value={{ activeSlug, openItem }}>
      {children}
      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            closing.current = true;
            dismissed.current = pending?.slug ?? item?.slug ?? null;
            setPending(null);
          }
          setOpen(next);
        }}
        onOpenChangeComplete={(isOpen) => {
          if (!isOpen && closing.current) {
            closing.current = false;
            if (item) router.replace(closeHref, { scroll: false });
          }
        }}
        title={title}
        subheader={shown ? shown.subheader : <SubheaderPlaceholder />}
        headerAction={shown?.headerAction}
        titleClassName={titleClassName}
        size="xl"
      >
        {shown ? shown.body : <BodyPlaceholder />}
      </Drawer>
    </Context.Provider>
  );
}

function SubheaderPlaceholder() {
  return (
    <div aria-hidden="true" className="space-y-2">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

function BodyPlaceholder() {
  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true" className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-4 w-4/5 max-w-prose" />
      </div>
      <Skeleton aria-hidden="true" className="h-8 w-40" />
      <div aria-hidden="true" className="space-y-3 border-t pt-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
