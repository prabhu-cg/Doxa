import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/link-button";
import type { BoardSort } from "@/features/items/schema";

type FilterOption = { slug: string; name: string };

const selectClass =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-10 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";

const SORT_LABELS: Record<BoardSort, string> = {
  newest: "Newest",
  "most-voted": "Most voted",
  "recently-updated": "Recently updated",
};

/**
 * A plain GET `<form>` — no client JS required to filter/search a board's
 * Items, matching "Server Components by default." `basePath` is the board
 * page to submit back to (admin or public).
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
  current: {
    q?: string;
    itemType?: string;
    status?: string;
    category?: string;
    tag?: string;
    sort?: BoardSort;
  };
}) {
  const hasFilters =
    !!current.q ||
    !!current.itemType ||
    !!current.status ||
    !!current.category ||
    !!current.tag;

  return (
    <form
      method="GET"
      action={basePath}
      className="flex flex-wrap items-center gap-2"
    >
      <Input
        type="search"
        name="q"
        placeholder="Search items…"
        defaultValue={current.q}
        className="max-w-xs"
        aria-label="Search items"
      />
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
      {tags.length > 0 ? (
        <select
          name="tag"
          defaultValue={current.tag ?? ""}
          className={selectClass}
          aria-label="Filter by tag"
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      ) : null}
      <select
        name="sort"
        defaultValue={current.sort ?? "newest"}
        className={selectClass}
        aria-label="Sort items"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm">
        Filter
      </Button>
      {hasFilters ? (
        <LinkButton href={basePath} variant="ghost" size="sm">
          Clear
        </LinkButton>
      ) : null}
    </form>
  );
}
