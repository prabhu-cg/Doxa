"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOARD_SORTS, type BoardSort } from "@/features/items/schema";

type Option = { slug: string; name: string };
type Current = {
  q?: string;
  itemType?: string;
  status?: string;
  category?: string;
  tag?: string;
  sort?: BoardSort;
};

const SORT_LABELS: Record<BoardSort, string> = {
  newest: "Newest",
  "most-voted": "Most voted",
  "recently-updated": "Recently updated",
};

const control =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring placeholder:text-foreground/60 h-9 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-2";

/**
 * Search, filters and sort for the grid. Every change goes into the URL — so a
 * filtered view can be shared and survives a reload — and applies as soon as it
 * is made: selects at once, search once typing pauses. `basePath` is the board's
 * own address, passed in because the URL is the item's while its drawer is open.
 */
export function GridToolbar({
  basePath,
  current,
  itemTypes,
  statuses,
  categories,
  tags,
  itemNounPlural,
}: {
  basePath: string;
  current: Current;
  itemTypes: Option[];
  statuses: Option[];
  categories: Option[];
  tags: Option[];
  itemNounPlural: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(current.q ?? "");
  const latest = useRef(current);
  latest.current = current;

  function go(next: Current) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value && !(key === "sort" && value === "newest")) {
        params.set(key, value);
      }
    }
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${basePath}?${query}` : basePath, {
        scroll: false,
      }),
    );
  }

  useEffect(() => {
    if (q === (latest.current.q ?? "")) return;
    const timer = setTimeout(() => go({ ...latest.current, q: q.trim() }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `go` only closes over stable values
  }, [q]);

  const hasFilters =
    !!current.q ||
    !!current.itemType ||
    !!current.status ||
    !!current.category ||
    !!current.tag;

  function select(
    key: keyof Current,
    label: string,
    allLabel: string,
    options: Option[],
  ) {
    if (options.length === 0) return null;
    return (
      <select
        aria-label={label}
        value={current[key] ?? ""}
        onChange={(event) => go({ ...current, [key]: event.target.value })}
        className={`${control} w-full sm:w-auto`}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div
      role="search"
      aria-busy={pending}
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
    >
      <div className="relative col-span-2 min-w-[12rem] sm:col-auto sm:max-w-xs sm:flex-1">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
        />
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={`Search ${itemNounPlural.toLowerCase()}…`}
          aria-label={`Search ${itemNounPlural.toLowerCase()}`}
          className={`${control} w-full pl-8`}
        />
      </div>
      {select("itemType", "Filter by type", "All types", itemTypes)}
      {select("status", "Filter by status", "All statuses", statuses)}
      {select("category", "Filter by category", "All categories", categories)}
      {select("tag", "Filter by tag", "All tags", tags)}
      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setQ("");
            go({ sort: current.sort });
          }}
        >
          <X />
          Clear
        </Button>
      ) : null}
      <select
        aria-label="Sort"
        value={current.sort ?? "newest"}
        onChange={(event) =>
          go({ ...current, sort: event.target.value as BoardSort })
        }
        className={`${control} col-span-2 w-full sm:col-auto sm:ml-auto sm:w-auto`}
      >
        {BOARD_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {SORT_LABELS[sort]}
          </option>
        ))}
      </select>
    </div>
  );
}
