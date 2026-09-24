import Link from "next/link";
import { ArrowDown, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DecisionBadge } from "@/components/decision-badge";
import type { DECISION_TYPES } from "@/features/decisions/schema";
import type { ItemWithRelations } from "@/features/items/queries";
import type { BoardSort } from "@/features/items/schema";
import type { Viewer } from "@/features/participation/access";
import { authPath } from "@/lib/safe-next";
import { badgeColors } from "@/lib/brand-color";
import { DECISION_TYPE_LABELS } from "@/features/decisions/schema";
import { cn, formatRelativeTime } from "@/lib/utils";
import { GridRow } from "./grid-row";
import { VoteChip } from "./vote-chip";

type Decision = (typeof DECISION_TYPES)[number];

function tint(color?: string | null) {
  const badge = badgeColors(color);
  return badge
    ? { backgroundColor: badge.background, color: badge.color }
    : undefined;
}

/** Columns that appear as the screen widens, so a phone gets the vote, the
 * title and the essentials, and a wide desktop gets everything. */
const FROM_MD = "hidden md:table-cell";
const FROM_XL = "hidden xl:table-cell";

const TH =
  "text-muted-foreground bg-background border-b px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap";

function SortHeader({
  label,
  sort,
  active,
  href,
  className,
}: {
  label: string;
  sort: BoardSort;
  active: BoardSort;
  href: (sort: BoardSort) => string;
  className?: string;
}) {
  const current = active === sort;
  return (
    <th
      scope="col"
      aria-sort={current ? "descending" : "none"}
      className={cn(TH, className)}
    >
      <Link
        href={href(sort)}
        scroll={false}
        className={cn(
          "hover:text-foreground inline-flex items-center gap-1 rounded-sm transition-colors",
          current && "text-foreground",
        )}
      >
        {label}
        {current ? <ArrowDown aria-hidden="true" className="size-3" /> : null}
      </Link>
    </th>
  );
}

/**
 * The board as a data grid: one row per item, the vote first, the team's
 * decision next to the status. A row opens its item in the drawer. Real
 * `<table>` semantics, so screen readers announce columns and rows.
 */
export function ItemGrid({
  items,
  decisionTypes,
  votedIds,
  viewer,
  orgSlug,
  boardSlug,
  sort,
  nounSingular,
  nounPlural,
  sortHref,
  itemHref,
}: {
  items: ItemWithRelations[];
  decisionTypes: Map<string, Decision>;
  votedIds: Set<string>;
  viewer: Viewer;
  orgSlug: string;
  boardSlug: string;
  sort: BoardSort;
  /** What the organisation calls an item ("Idea"), for the column and caption. */
  nounSingular: string;
  nounPlural: string;
  sortHref: (sort: BoardSort) => string;
  /** The board's address with this item's drawer open. */
  itemHref: (itemSlug: string) => string;
}) {
  const basePath = `/b/${orgSlug}/${boardSlug}`;
  const signIn = authPath("login", basePath);

  const access =
    viewer.status === "active"
      ? ({ kind: "open" } as const)
      : viewer.status === "anonymous"
        ? ({ kind: "sign-in", href: signIn } as const)
        : ({
            kind: "closed",
            reason:
              viewer.status === "unverified"
                ? "Confirm your email address to vote"
                : "You can't take part in this community",
          } as const);

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <caption className="sr-only">{nounPlural} on this board</caption>
      <thead className="max-md:sr-only">
        <tr>
          <SortHeader
            label="Votes"
            sort="most-voted"
            active={sort}
            href={sortHref}
            className="sticky top-[var(--public-topbar)] z-10 w-[4.5rem] pl-1"
          />
          <th
            scope="col"
            className={cn(TH, "sticky top-[var(--public-topbar)] z-10")}
          >
            {nounSingular}
          </th>
          <th
            scope="col"
            className={cn(
              TH,
              FROM_MD,
              "sticky top-[var(--public-topbar)] z-10",
            )}
          >
            Status
          </th>
          <th
            scope="col"
            className={cn(
              TH,
              FROM_MD,
              "sticky top-[var(--public-topbar)] z-10",
            )}
          >
            Team decision
          </th>
          <th
            scope="col"
            className={cn(
              TH,
              FROM_XL,
              "sticky top-[var(--public-topbar)] z-10",
            )}
          >
            Type
          </th>
          <th
            scope="col"
            className={cn(
              TH,
              FROM_XL,
              "sticky top-[var(--public-topbar)] z-10",
            )}
          >
            Tags
          </th>
          <th
            scope="col"
            className={cn(
              TH,
              FROM_MD,
              "sticky top-[var(--public-topbar)] z-10",
            )}
          >
            <span className="sr-only">Comments</span>
            <MessageSquare aria-hidden="true" className="size-3.5" />
          </th>
          <SortHeader
            label="Updated"
            sort="recently-updated"
            active={sort}
            href={sortHref}
            className={cn(FROM_MD, "sticky top-[var(--public-topbar)] z-10")}
          />
          <th
            scope="col"
            className={cn(
              TH,
              FROM_XL,
              "sticky top-[var(--public-topbar)] z-10",
            )}
          >
            Submitted by
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const href = itemHref(item.slug);
          const decision = decisionTypes.get(item.id);
          const commentCount = item._count.comments;
          // When the decision only repeats the status ("Planned" / "Planned"), the
          // decision keeps its colour and the status goes quiet, so a row has one
          // coloured answer and not the same word twice in two colours.
          const repeatsStatus =
            !!decision &&
            DECISION_TYPE_LABELS[decision].toLowerCase() ===
              item.status.name.toLowerCase();
          const status = repeatsStatus ? (
            <Badge variant="outline">{item.status.name}</Badge>
          ) : (
            <Badge variant="soft" style={tint(item.status.color)}>
              {item.status.name}
            </Badge>
          );
          const decisionBadge = decision ? (
            <DecisionBadge type={decision} bare />
          ) : null;

          return (
            <GridRow
              key={item.id}
              href={href}
              itemSlug={item.slug}
              itemTitle={item.title}
            >
              <td className="border-b py-3 pr-1 pl-1 align-top">
                <VoteChip
                  // The chip keeps its own optimistic copy of the count; a new
                  // server value (a vote made in the drawer) has to replace it.
                  key={`${votedIds.has(item.id)}-${item._count.votes}`}
                  orgSlug={orgSlug}
                  boardSlug={boardSlug}
                  itemSlug={item.slug}
                  itemTitle={item.title}
                  initialVoted={votedIds.has(item.id)}
                  initialCount={item._count.votes}
                  access={access}
                />
              </td>
              <td className="border-b px-3 py-3 align-top">
                <Link
                  href={href}
                  scroll={false}
                  data-row-title
                  className="hover:text-primary-text focus-visible:ring-ring line-clamp-2 rounded-sm text-[15px] leading-snug font-semibold outline-none focus-visible:ring-2"
                >
                  {item.title}
                </Link>
                {item.description ? (
                  <p className="text-muted-foreground mt-0.5 line-clamp-1 max-w-[70ch] text-[13px]">
                    {item.description}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 md:hidden">
                  {status}
                  {decisionBadge}
                  <span className="text-muted-foreground flex items-center gap-1 text-xs tabular-nums">
                    <MessageSquare aria-hidden="true" className="size-3" />
                    {commentCount}
                    <span className="sr-only">
                      {commentCount === 1 ? "comment" : "comments"}
                    </span>
                  </span>
                </div>
              </td>
              <td className={cn("border-b px-3 py-3 align-top", FROM_MD)}>
                {status}
              </td>
              <td className={cn("border-b px-3 py-3 align-top", FROM_MD)}>
                {decisionBadge ?? (
                  <span className="text-muted-foreground">
                    <span aria-hidden="true">—</span>
                    <span className="sr-only">No decision yet</span>
                  </span>
                )}
              </td>
              <td
                className={cn(
                  "text-muted-foreground border-b px-3 py-3 align-top whitespace-nowrap",
                  FROM_XL,
                )}
              >
                {item.itemType.name}
              </td>
              <td className={cn("border-b px-3 py-3 align-top", FROM_XL)}>
                <div className="flex max-w-[14rem] flex-wrap gap-1">
                  {item.tags.slice(0, 2).map(({ tag }) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                  {item.tags.length > 2 ? (
                    <span className="text-muted-foreground text-xs">
                      +{item.tags.length - 2}
                    </span>
                  ) : null}
                </div>
              </td>
              <td
                className={cn(
                  "text-muted-foreground border-b px-3 py-3 align-top text-xs tabular-nums",
                  FROM_MD,
                )}
              >
                {commentCount}
              </td>
              <td
                className={cn(
                  "text-muted-foreground border-b px-3 py-3 align-top text-xs whitespace-nowrap",
                  FROM_MD,
                )}
              >
                {formatRelativeTime(item.updatedAt)}
              </td>
              <td
                className={cn(
                  "text-muted-foreground border-b px-3 py-3 align-top text-xs",
                  FROM_XL,
                )}
              >
                <span className="block max-w-[10rem] truncate">
                  {item.author.displayName}
                </span>
              </td>
            </GridRow>
          );
        })}
      </tbody>
    </table>
  );
}
