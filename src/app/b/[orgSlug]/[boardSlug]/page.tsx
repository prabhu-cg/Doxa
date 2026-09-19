import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVisibleBoard } from "@/features/boards/queries";
import { listItemsForBoard } from "@/features/items/queries";
import {
  boardFiltersSchema,
  type BoardFiltersValues,
} from "@/features/items/schema";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { listStatusesForOrganization } from "@/features/statuses/queries";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import { listTagsForOrganization } from "@/features/tags/queries";
import { ItemFilters } from "@/components/item-filters";
import { ItemCard } from "@/components/item-card";
import {
  getCurrentDecisionTypesForItems,
  getResponseSummaryForBoard,
} from "@/features/decisions/transparency";
import { getItemTerminology } from "@/features/organizations/terminology";
import { describeResponsiveness } from "@/lib/decision-stats";
import { publicRoadmapPath } from "@/lib/public-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug, boardSlug } = await params;
  const visible = await getVisibleBoard(orgSlug, boardSlug);
  if (!visible) return {};
  return {
    title: `${visible.board.name} · ${visible.organization.name}`,
    description: visible.board.description ?? undefined,
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

  const [items, itemTypes, statuses, categories, tags] = await Promise.all([
    listItemsForBoard(board.id, {
      q: filters.q,
      itemTypeSlug: filters.itemType,
      statusSlug: filters.status,
      categorySlug: filters.category,
      tagSlug: filters.tag,
      sort: filters.sort,
    }),
    listItemTypesForOrganization(organization.id),
    listStatusesForOrganization(organization.id),
    listCategoriesForOrganization(organization.id),
    listTagsForOrganization(organization.id),
  ]);

  const [decisionTypes, responsiveness] = await Promise.all([
    getCurrentDecisionTypesForItems(items.map((item) => item.id)),
    getResponseSummaryForBoard(board.id),
  ]);
  const responsivenessLine = describeResponsiveness(
    responsiveness,
    getItemTerminology(organization),
  );

  const basePath = `/b/${orgSlug}/${boardSlug}`;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <Link
          href="/"
          className="text-muted-foreground text-sm font-semibold tracking-tight"
        >
          Doxa
        </Link>
        <div className="flex items-center gap-2">
          {organization.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external, org-supplied URL; not a static/local asset next/image can optimize.
            <img
              src={organization.logoUrl}
              alt={`${organization.name} logo`}
              className="size-6 rounded object-contain"
            />
          ) : null}
          <h1
            className="text-2xl font-bold tracking-tight"
            style={
              organization.accentColor
                ? { color: organization.accentColor }
                : undefined
            }
          >
            {board.name}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {organization.name}
          {board.description ? ` · ${board.description}` : ""}
        </p>
        {responsivenessLine ? (
          <p className="text-muted-foreground mt-1 text-sm">
            {responsivenessLine}
          </p>
        ) : null}
        <p className="mt-1 text-sm">
          <Link
            href={publicRoadmapPath(orgSlug)}
            className="text-foreground underline underline-offset-4"
          >
            See the roadmap
          </Link>
        </p>
      </div>

      <ItemFilters
        basePath={basePath}
        itemTypes={itemTypes}
        statuses={statuses}
        categories={categories}
        tags={tags}
        current={filters}
      />

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No items match.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              href={`${basePath}/${item.slug}`}
              title={item.title}
              description={item.description}
              itemTypeName={item.itemType.name}
              statusName={item.status.name}
              statusColor={item.status.color}
              categoryName={item.category?.name}
              decisionType={decisionTypes.get(item.id)}
              tagNames={item.tags.map((t) => t.tag.name)}
              authorName={item.author.displayName}
              voteCount={item._count.votes}
              commentCount={item._count.comments}
              priorityName={
                item.priority.slug !== "none" ? item.priority.name : null
              }
              priorityColor={item.priority.color}
              updatedAt={item.updatedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
