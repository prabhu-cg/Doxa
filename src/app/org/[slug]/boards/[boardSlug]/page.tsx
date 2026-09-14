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
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { ItemFilters } from "@/components/item-filters";
import { ItemCard } from "@/components/item-card";

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
      { includeArchived: true },
    ),
    listItemTypesForOrganization(membership.organization.id),
    listStatusesForOrganization(membership.organization.id),
    listCategoriesForOrganization(membership.organization.id),
    listTagsForOrganization(membership.organization.id),
  ]);

  const basePath = `/org/${slug}/boards/${boardSlug}`;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{board.name}</h1>
            <Badge variant="outline">{board.visibility}</Badge>
            {board.status === "ARCHIVED" ? (
              <Badge variant="secondary">Archived</Badge>
            ) : null}
          </div>
          {board.description ? (
            <p className="text-muted-foreground text-sm">{board.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {canCreateItem(membership.role) && board.status === "ACTIVE" ? (
            <LinkButton href={`${basePath}/items/new`}>New item</LinkButton>
          ) : null}
          {canManageBoards(membership.role) ? (
            <LinkButton variant="outline" href={`${basePath}/settings`}>
              Settings
            </LinkButton>
          ) : null}
        </div>
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
              href={`${basePath}/items/${item.slug}`}
              title={item.title}
              description={item.description}
              itemTypeName={item.itemType.name}
              statusName={item.status.name}
              statusColor={item.status.color}
              categoryName={item.category?.name}
              tagNames={item.tags.map((t) => t.tag.name)}
              authorName={item.author.displayName}
              voteCount={item._count.votes}
              commentCount={item._count.comments}
              archived={!!item.archivedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
