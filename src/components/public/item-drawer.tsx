"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/drawer";

/**
 * An item opened from the grid, in a right-hand drawer over the list. The drawer
 * is part of the board's own address (`?item=…`), so it survives a reload, can be
 * shared, and the browser's Back button closes it. It mounts closed and opens on
 * the next frame — a sheet that mounts already open has nothing to slide in from
 * — and closing slides it out first, then drops the parameter, leaving the board
 * with the same filters, sort and scroll position it had.
 */
export function ItemDrawer({
  title,
  subheader,
  headerAction,
  closeHref,
  children,
}: {
  title: string;
  subheader?: React.ReactNode;
  headerAction?: React.ReactNode;
  closeHref: string;
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
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) closing.current = true;
        setOpen(next);
      }}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen && closing.current) {
          router.replace(closeHref, { scroll: false });
        }
      }}
      title={title}
      subheader={subheader}
      headerAction={headerAction}
      titleClassName="line-clamp-4 text-xl leading-snug font-bold tracking-tight"
      size="xl"
    >
      {children}
    </Drawer>
  );
}
