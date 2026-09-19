import Link from "next/link";
import { requireBoardForOrgMember } from "@/features/boards/queries";
import { canManageBoards } from "@/features/boards/permissions";
import { canCreateItem } from "@/features/items/permissions";
import { listItemsForBoard } from "@/features/items/queries";
import {
  boardFiltersSchema,
  type BoardFiltersValues,
} from "@/features/items/schema";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { listStatusesForOrganization } from "@/features/statuses/queries";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import { listTagsForOrganization } from "@/features/tags/queries";
import { getItemTerminology } from "@/features/organizations/terminology";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { ItemFilters } from "@/components/item-filters";
import { ItemCard } from "@/components/item-card";
import { EntityGrid } from "@/components/entity-card";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { spaceTrail } from "@/lib/breadcrumb-trails";
import { getCurrentDecisionTypesForItems } from "@/features/decisions/transparency";
import { publicBoardPath } from "@/lib/public-links";
import { CopyLinkButton } from "@/components/public-link";

export default async function BoardAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; boardSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, boardSlug } = await params;
  const rawFilters = await searchParams;
  const { membership, board } = await requireBoardForOrgMember(slug, boardSlug);

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
    listItemsForBoard(
      board.id,
      {
        q: filters.q,
        itemTypeSlug: filters.itemType,
        statusSlug: filters.status,
        categorySlug: filters.category,
        tagSlug: filters.tag,
        sort: filters.sort,
      },
      { includeArchived: true, includePending: true },
    ),
    listItemTypesForOrganization(membership.organization.id),
    listStatusesForOrganization(membership.organization.id),
    listCategoriesForOrganization(membership.organization.id),
    listTagsForOrganization(membership.organization.id),
  ]);

  const decisionTypes = await getCurrentDecisionTypesForItems(
    items.map((item) => item.id),
  );
  const basePath = `/org/${slug}/boards/${boardSlug}`;
  const terminology = getItemTerminology(membership.organization);

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[...spaceTrail(slug, board.space), { label: board.name }]}
        title={board.name}
        badges={
          <>
            <Badge variant="outline">{board.visibility}</Badge>
            {board.status === "ARCHIVED" ? (
              <Badge variant="secondary">Archived</Badge>
            ) : null}
          </>
        }
        description={
          board.description ? (
            board.description
          ) : canManageBoards(membership.role) ? (
            <span className="italic">
              No description yet —{" "}
              <Link
                href={`${basePath}/settings`}
                className="underline underline-offset-2"
              >
                add one
              </Link>{" "}
              so contributors know what belongs on this board.
            </span>
          ) : null
        }
        actions={
          <>
            {canCreateItem(membership.role) && board.status === "ACTIVE" ? (
              <LinkButton href={`${basePath}/items/new`}>
                New {terminology.singular}
              </LinkButton>
            ) : null}
            {board.visibility === "PUBLIC" && board.status === "ACTIVE" ? (
              <CopyLinkButton path={publicBoardPath(slug, boardSlug)} />
            ) : null}
            {canManageBoards(membership.role) ? (
              <LinkButton variant="outline" href={`${basePath}/settings`}>
                Settings
              </LinkButton>
            ) : null}
          </>
        }
      />

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
        <EntityGrid>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              href={`${basePath}/items/${item.slug}`}
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
              archived={!!item.archivedAt}
              awaitingReview={item.awaitingReview}
            />
          ))}
        </EntityGrid>
      )}
    </PageContainer>
  );
}
