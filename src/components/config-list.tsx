"use client";

import type { ReactNode } from "react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * A flat, divided list for an organisation's configurable data (item types,
 * statuses, priorities, scoring criteria, categories, tags). Each row keeps
 * its actions in one menu instead of a button per action, so a long list
 * stays quiet and the names get the room.
 */
export function ConfigList({ children }: { children: ReactNode }) {
  return <ul className="divide-y border-b">{children}</ul>;
}

export function ConfigRow({
  name,
  leading,
  badges,
  description,
  actions,
}: {
  name: string;
  /** Sits before the name, e.g. a colour dot. */
  leading?: ReactNode;
  /** Sits after the name, e.g. "Default" or "Archived". */
  badges?: ReactNode;
  description?: string | null;
  /** `DropdownMenuItem`s for the row's menu. Omit to show no menu. */
  actions?: ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {leading}
          <span className="text-sm font-semibold break-words">{name}</span>
          {badges}
        </div>
        {description ? (
          <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                aria-label={`Actions for ${name}`}
              />
            }
          >
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {actions}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </li>
  );
}

/** Stands in for a row while it is being edited. The side nav's cream marks
 * it as that row opened up, not another "add" form, and the fields inside
 * stay white so they still read as inputs on it. */
export function ConfigEditRow({ children }: { children: ReactNode }) {
  return (
    <li className="bg-sidebar [&_input]:bg-background [&_textarea]:bg-background -mx-3 rounded-lg px-3 py-4">
      {children}
    </li>
  );
}
