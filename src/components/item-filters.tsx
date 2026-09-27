"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ListFilter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { BoardSort } from "@/features/items/schema";

type FilterOption = { slug: string; name: string };

type MultiKey = "itemType" | "status" | "category" | "tag";

type Current = {
  q?: string;
  itemType?: string[];
  status?: string[];
  category?: string[];
  tag?: string[];
  origin?: "team" | "community";
  sort?: BoardSort;
};

const selectClass =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";

const SORT_LABELS: Record<BoardSort, string> = {
  newest: "Newest",
  "most-voted": "Most voted",
  "recently-updated": "Recently updated",
};

const ORIGIN_LABELS: Record<"team" | "community", string> = {
  team: "Team",
  community: "Community",
};

function nameFor(options: FilterOption[], slug: string): string {
  return options.find((option) => option.slug === slug)?.name ?? slug;
}

/**
 * A pill-style toggle inside the filter popover — checked state shows a
 * check mark and the primary color, same visual language as an active
 * filter chip.
 */
function FilterPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
        selected
          ? "border-primary bg-primary-soft text-primary-text"
          : "border-border text-foreground hover:bg-muted",
      )}
    >
      {selected ? <Check className="size-3.5" /> : null}
      {label}
    </button>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="border-primary bg-primary-soft text-primary-text inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="hover:opacity-70"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

/**
 * Search, a "Filter" popover of pill-toggle groups, and sort — for the
 * board admin item list. Filters apply live (URL-driven, so a filtered
 * view can be shared or reloaded), same `router.replace` + transition
 * pattern as the public board's GridToolbar (components/public/grid-toolbar.tsx).
 */
export function ItemFilters({
  basePath,
  itemTypes,
  statuses,
  categories,
  tags,
  current,
}: {
  basePath: string;
  itemTypes: FilterOption[];
  statuses: FilterOption[];
  categories: FilterOption[];
  tags: FilterOption[];
  current: Current;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(current.q ?? "");
  const [open, setOpen] = useState(false);
  const latest = useRef(current);
  useEffect(() => {
    latest.current = current;
  });

  function go(next: Current) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    for (const slug of next.itemType ?? []) params.append("itemType", slug);
    for (const slug of next.status ?? []) params.append("status", slug);
    for (const slug of next.category ?? []) params.append("category", slug);
    for (const slug of next.tag ?? []) params.append("tag", slug);
    if (next.origin) params.set("origin", next.origin);
    if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
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

  function toggle(key: MultiKey, slug: string) {
    const values = current[key] ?? [];
    const next = values.includes(slug)
      ? values.filter((v) => v !== slug)
      : [...values, slug];
    go({ ...current, [key]: next.length > 0 ? next : undefined });
  }

  function setOrigin(value?: "team" | "community") {
    go({ ...current, origin: current.origin === value ? undefined : value });
  }

  function clearFilters() {
    go({
      q: undefined,
      itemType: undefined,
      status: undefined,
      category: undefined,
      tag: undefined,
      origin: undefined,
      sort: current.sort,
    });
    setQ("");
  }

  const filterCount =
    (current.itemType?.length ?? 0) +
    (current.status?.length ?? 0) +
    (current.category?.length ?? 0) +
    (current.tag?.length ?? 0) +
    (current.origin ? 1 : 0);
  const hasAnyFilter = filterCount > 0 || !!current.q;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          placeholder="Search items…"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="max-w-xs"
          aria-label="Search items"
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button type="button" variant="outline" size="sm">
                <ListFilter />
                Filter
                {filterCount > 0 ? (
                  <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-xs tabular-nums">
                    {filterCount}
                  </span>
                ) : null}
              </Button>
            }
          />
          <PopoverContent className="w-80 max-h-[70vh] overflow-y-auto sm:w-96" align="start">
            <div className="mb-3 flex items-center justify-between border-b pb-2">
              <span className="font-medium">Filter items</span>
              {filterCount > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
                >
                  <X className="size-3.5" />
                  Clear {filterCount}
                </button>
              ) : null}
            </div>

            <div className="flex flex-col gap-4">
              {itemTypes.length > 0 ? (
                <section>
                  <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                    Type
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {itemTypes.map((option) => (
                      <FilterPill
                        key={option.slug}
                        label={option.name}
                        selected={!!current.itemType?.includes(option.slug)}
                        onClick={() => toggle("itemType", option.slug)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {statuses.length > 0 ? (
                <section>
                  <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                    Status
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {statuses.map((option) => (
                      <FilterPill
                        key={option.slug}
                        label={option.name}
                        selected={!!current.status?.includes(option.slug)}
                        onClick={() => toggle("status", option.slug)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {categories.length > 0 ? (
                <section>
                  <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                    Category
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((option) => (
                      <FilterPill
                        key={option.slug}
                        label={option.name}
                        selected={!!current.category?.includes(option.slug)}
                        onClick={() => toggle("category", option.slug)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {tags.length > 0 ? (
                <section>
                  <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((option) => (
                      <FilterPill
                        key={option.slug}
                        label={option.name}
                        selected={!!current.tag?.includes(option.slug)}
                        onClick={() => toggle("tag", option.slug)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                  Who
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <FilterPill
                    label="Everyone"
                    selected={!current.origin}
                    onClick={() => setOrigin(undefined)}
                  />
                  <FilterPill
                    label="Team"
                    selected={current.origin === "team"}
                    onClick={() => setOrigin("team")}
                  />
                  <FilterPill
                    label="Community"
                    selected={current.origin === "community"}
                    onClick={() => setOrigin("community")}
                  />
                </div>
              </section>
            </div>
          </PopoverContent>
        </Popover>

        <select
          value={current.sort ?? "newest"}
          onChange={(event) =>
            go({ ...current, sort: event.target.value as BoardSort })
          }
          className={cn(selectClass, "sm:ml-auto")}
          aria-label="Sort items"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {hasAnyFilter ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {current.itemType?.map((slug) => (
            <FilterChip
              key={`itemType-${slug}`}
              label={nameFor(itemTypes, slug)}
              onRemove={() => toggle("itemType", slug)}
            />
          ))}
          {current.status?.map((slug) => (
            <FilterChip
              key={`status-${slug}`}
              label={nameFor(statuses, slug)}
              onRemove={() => toggle("status", slug)}
            />
          ))}
          {current.category?.map((slug) => (
            <FilterChip
              key={`category-${slug}`}
              label={nameFor(categories, slug)}
              onRemove={() => toggle("category", slug)}
            />
          ))}
          {current.tag?.map((slug) => (
            <FilterChip
              key={`tag-${slug}`}
              label={nameFor(tags, slug)}
              onRemove={() => toggle("tag", slug)}
            />
          ))}
          {current.origin ? (
            <FilterChip
              label={ORIGIN_LABELS[current.origin]}
              onRemove={() => setOrigin(undefined)}
            />
          ) : null}
          <button
            type="button"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}
