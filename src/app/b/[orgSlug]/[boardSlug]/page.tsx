import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVisibleBoard } from "@/features/boards/queries";
import {
  countItemsForBoard,
  getBoardTotals,
  listItemsForBoard,
} from "@/features/items/queries";
import {
  boardFiltersSchema,
  type BoardFiltersValues,
  type BoardSort,
} from "@/features/items/schema";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { listStatusesForOrganization } from "@/features/statuses/queries";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import { listTagsForOrganization } from "@/features/tags/queries";
import {
  getCurrentDecisionTypesForItems,
  getResponseSummaryForBoard,
} from "@/features/decisions/transparency";
import { getItemTerminology } from "@/features/organizations/terminology";
import { getAuthenticatedSupabaseUser } from "@/features/auth/queries";
import { getViewer } from "@/features/participation/access";
import { listVotedItemIds } from "@/features/votes/queries";
import { describeResponsiveness } from "@/lib/decision-stats";
import {
  publicBoardPath,
  publicItemPath,
  publicRoadmapPath,
} from "@/lib/public-links";
import { ItemGrid } from "@/components/public/item-grid";
import { OrgIdentity } from "@/components/public/org-identity";
import { ItemDrawerHost } from "@/components/public/item-drawer";
import {
  ItemDrawerSubheader,
  OpenPageLink,
  PublicItemDetail,
} from "@/components/public/public-item-detail";
import { findPublicItem } from "@/features/items/public";
import { GridToolbar } from "@/components/public/grid-toolbar";
import { SubmitDrawer } from "@/components/participation/submit-drawer";
import { ParticipationNotice } from "@/components/participation/participation-notice";

const PAGE_SIZE = 50;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug, boardSlug } = await params;
  const visible = await getVisibleBoard(orgSlug, boardSlug);
  if (!visible) return {};
  const title = `${visible.board.name} · ${visible.organization.name}`;
  const description =
    visible.board.description ??
    `Vote on what matters and see how ${visible.organization.name} responds.`;
  return {
    title,
    description,
    openGraph: { title, description, siteName: visible.organization.name },
  };
}

export default async function PublicBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orgSlug, boardSlug } = await params;
  const rawFilters = await searchParams;
  const visible = await getVisibleBoard(orgSlug, boardSlug);
  if (!visible) notFound();
  const { organization, board } = visible;

  const parsedFilters = boardFiltersSchema.safeParse({
    q: rawFilters.q,
    itemType: rawFilters.itemType,
    status: rawFilters.status,
    category: rawFilters.category,
    tag: rawFilters.tag,
    sort: rawFilters.sort,
  });
  const filters: Partial<BoardFiltersValues> = parsedFilters.success
    ? parsedFilters.data
    : {};
  const sort: BoardSort = filters.sort ?? "newest";
  const limit = Math.min(
    Math.max(
      Number.parseInt(String(rawFilters.limit ?? ""), 10) || PAGE_SIZE,
      PAGE_SIZE,
    ),
    1000,
  );

  const openItemSlug =
    typeof rawFilters.item === "string" && rawFilters.item
      ? rawFilters.item
      : null;

  const terminology = getItemTerminology(organization);
  const basePath = publicBoardPath(orgSlug, boardSlug);
  const user = await getAuthenticatedSupabaseUser();

  const boardFilters = {
    q: filters.q,
    itemTypeSlug: filters.itemType,
    statusSlug: filters.status,
    categorySlug: filters.category,
    tagSlug: filters.tag,
    sort: filters.sort,
  };

  // The open item loads alongside the board, not before it.
  const [
    openItem,
    viewer,
    items,
    matching,
    itemTypes,
    statuses,
    categories,
    tags,
    totals,
    summary,
  ] = await Promise.all([
    openItemSlug ? findPublicItem(orgSlug, boardSlug, openItemSlug) : null,
    getViewer(organization.id, user),
    listItemsForBoard(board.id, boardFilters, { take: limit }),
    countItemsForBoard(board.id, boardFilters),
    listItemTypesForOrganization(organization.id),
    listStatusesForOrganization(organization.id),
    listCategoriesForOrganization(organization.id),
    listTagsForOrganization(organization.id),
    getBoardTotals(board.id),
    getResponseSummaryForBoard(board.id),
  ]);

  const [decisionTypes, votedIds] = await Promise.all([
    getCurrentDecisionTypesForItems(items.map((item) => item.id)),
    viewer.status === "anonymous"
      ? new Set<string>()
      : listVotedItemIds(
          viewer.profile.id,
          items.map((item) => item.id),
        ),
  ]);

  const isMember = viewer.status === "active" && viewer.role !== null;
  const responsivenessLine = describeResponsiveness(summary, terminology);
  const hasFilters =
    !!filters.q ||
    !!filters.itemType ||
    !!filters.status ||
    !!filters.category ||
    !!filters.tag;

  /** The board's own address with the current filters, and a different sort. */
  function href(next: { sort?: BoardSort; limit?: number; item?: string }) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.itemType) params.set("itemType", filters.itemType);
    if (filters.status) params.set("status", filters.status);
    if (filters.category) params.set("category", filters.category);
    if (filters.tag) params.set("tag", filters.tag);
    const nextSort = next.sort ?? sort;
    if (nextSort !== "newest") params.set("sort", nextSort);
    if (limit > PAGE_SIZE || (next.limit && next.limit > PAGE_SIZE)) {
      params.set("limit", String(Math.max(limit, next.limit ?? 0)));
    }
    if (next.item) params.set("item", next.item);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const noun = terminology.plural.toLowerCase();

  function submit(variant: "default" | "outline") {
    return (
      <SubmitDrawer
        orgSlug={orgSlug}
        boardSlug={boardSlug}
        itemTypes={itemTypes.map((t) => ({ id: t.id, name: t.name }))}
        singular={terminology.singular}
        requiresReview={board.requireApproval && !isMember}
        triggerVariant={variant}
        blockedNotice={
          viewer.status === "active" ? undefined : (
            <ParticipationNotice
              viewer={viewer}
              next={basePath}
              action={`submit ${terminology.singular.toLowerCase()}`}
            />
          )
        }
      />
    );
  }

  return (
    <>
      <section
        aria-label={`About ${board.name}`}
        className="public-masthead border-b"
      >
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-end justify-between gap-x-8 gap-y-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex max-w-3xl min-w-0 items-start gap-4 sm:gap-5">
            <OrgIdentity
              markOnly
              name={organization.name}
              logoUrl={organization.logoUrl}
              size={48}
              className="shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-[28px] leading-tight font-bold tracking-tight text-balance">
                {board.name}
              </h1>
              {board.description ? (
                <p className="text-foreground/75 mt-1.5 max-w-prose text-[15px] leading-6">
                  {board.description}
                </p>
              ) : null}
              <p className="text-foreground/75 mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <span>
                  <b className="text-foreground font-semibold tabular-nums">
                    {totals.items}
                  </b>{" "}
                  {totals.items === 1
                    ? terminology.singular.toLowerCase()
                    : noun}
                </span>
                <span>
                  <b className="text-foreground font-semibold tabular-nums">
                    {totals.votes}
                  </b>{" "}
                  {totals.votes === 1 ? "vote" : "votes"}
                </span>
                {responsivenessLine ? <span>{responsivenessLine}</span> : null}
                <Link
                  href={publicRoadmapPath(orgSlug)}
                  className="text-primary-text font-semibold underline-offset-4 hover:underline"
                >
                  See the roadmap
                </Link>
              </p>
            </div>
          </div>
          {submit("default")}
        </div>
      </section>

      <ItemDrawerHost
        closeHref={href({})}
        item={
          openItem
            ? {
                slug: openItem.item.slug,
                title: openItem.item.title,
                subheader: (
                  <ItemDrawerSubheader
                    orgSlug={orgSlug}
                    boardSlug={boardSlug}
                    itemSlug={openItem.item.slug}
                  />
                ),
                headerAction: (
                  <OpenPageLink
                    href={publicItemPath(
                      orgSlug,
                      boardSlug,
                      openItem.item.slug,
                    )}
                  />
                ),
                body: (
                  <PublicItemDetail
                    orgSlug={orgSlug}
                    boardSlug={boardSlug}
                    itemSlug={openItem.item.slug}
                    variant="drawer"
                  />
                ),
              }
            : null
        }
      >
        <div className="public-results mx-auto w-full max-w-[1400px] space-y-4 px-4 py-6 sm:px-6 lg:px-8">
          <GridToolbar
            basePath={basePath}
            current={{
              q: filters.q,
              itemType: filters.itemType,
              status: filters.status,
              category: filters.category,
              tag: filters.tag,
              sort,
            }}
            itemTypes={itemTypes}
            statuses={statuses}
            categories={categories}
            tags={tags}
            itemNounPlural={terminology.plural}
          />

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed px-6 py-16 text-center">
              <p className="font-semibold">
                {hasFilters ? `No ${noun} match` : `No ${noun} here yet`}
              </p>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                {hasFilters
                  ? "Try a different search, or clear the filters to see everything."
                  : `Start the conversation: what would you like ${organization.name} to know?`}
              </p>
              <div className="mt-4 flex justify-center">
                {hasFilters ? (
                  <Link
                    href={basePath}
                    className="text-primary-text text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    Clear filters
                  </Link>
                ) : (
                  submit("outline")
                )}
              </div>
            </div>
          ) : (
            <>
              <ItemGrid
                items={items}
                decisionTypes={decisionTypes}
                votedIds={votedIds}
                viewer={viewer}
                orgSlug={orgSlug}
                boardSlug={boardSlug}
                sort={sort}
                nounSingular={terminology.singular}
                nounPlural={terminology.plural}
                sortHref={(next) => href({ sort: next })}
                itemHref={(slug) => href({ item: slug })}
              />
              <p className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
                <span aria-live="polite">
                  Showing{" "}
                  <span className="tabular-nums">
                    {items.length} of {matching}
                  </span>{" "}
                  {matching === 1 ? terminology.singular.toLowerCase() : noun}
                </span>
                {matching > items.length ? (
                  <Link
                    href={href({ limit: limit + PAGE_SIZE })}
                    scroll={false}
                    className="text-primary-text text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    Show more
                  </Link>
                ) : null}
              </p>
            </>
          )}
        </div>
      </ItemDrawerHost>
    </>
  );
}
