"use client";

import { usePathname } from "next/navigation";

/** The address that didn't resolve, so the visitor can see what was asked for. */
export function NotFoundPath() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;
  return (
    <p className="text-muted-foreground mt-9 max-w-full text-xs">
      Looking for{" "}
      <code className="bg-primary-soft text-primary-text rounded-sm px-1.5 py-0.5 font-mono break-all">
        {pathname}
      </code>
      ? It isn&apos;t here.
    </p>
  );
}
