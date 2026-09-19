"use client";

import Link from "next/link";
import { ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OrgOption = { slug: string; name: string };

export function OrgSwitcher({
  current,
  options,
  className = "max-w-[220px]",
}: {
  current: OrgOption;
  options: OrgOption[];
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={cn("w-full justify-between gap-2", className)}
          >
            <span className="truncate">{current.name}</span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organisations</DropdownMenuLabel>
          {options.map((org) => (
            <DropdownMenuItem
              key={org.slug}
              render={<Link href={`/org/${org.slug}`}>{org.name}</Link>}
            />
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href="/org/new">
              <Plus className="size-4" />
              New organisation
            </Link>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
