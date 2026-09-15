import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/link-button";
import type { PrioritizationSort } from "@/features/prioritization/schema";

type FilterOption = { slug: string; name: string };

const selectClass =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-10 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";

const SORT_LABELS: Record<PrioritizationSort, string> = {
  votes: "Votes",
  priority: "Priority",
  status: "Status",
  type: "Type",
  category: "Category",
  score: "Score",
};

/** A plain GET `<form>`, same pattern as ItemFilters
 * (components/item-filters.tsx) — no client JS required to filter or sort
 * this internal view. */
export function PrioritizationFilters({
  basePath,
  itemTypes,
  statuses,
  categories,
  current,
  sorts,
}: {
  basePath: string;
  itemTypes: FilterOption[];
  statuses: FilterOption[];
  categories: FilterOption[];
  current: {
    itemType?: string;
    status?: string;
    category?: string;
    sort?: PrioritizationSort;
  };
  sorts: readonly PrioritizationSort[];
}) {
  const hasFilters =
    !!current.itemType || !!current.status || !!current.category;

  return (
    <form
      method="GET"
      action={basePath}
      className="flex flex-wrap items-center gap-2"
    >
      <select
        name="itemType"
        defaultValue={current.itemType ?? ""}
        className={selectClass}
        aria-label="Filter by item type"
      >
        <option value="">All types</option>
        {itemTypes.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={current.status ?? ""}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {statuses.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>
      {categories.length > 0 ? (
        <select
          name="category"
          defaultValue={current.category ?? ""}
          className={selectClass}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      ) : null}
      <select
        name="sort"
        defaultValue={current.sort ?? "votes"}
        className={selectClass}
        aria-label="Sort items"
      >
        {sorts.map((sort) => (
          <option key={sort} value={sort}>
            Sort by {SORT_LABELS[sort]}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm">
        Apply
      </Button>
      {hasFilters ? (
        <LinkButton href={basePath} variant="ghost" size="sm">
          Clear
        </LinkButton>
      ) : null}
    </form>
  );
}
