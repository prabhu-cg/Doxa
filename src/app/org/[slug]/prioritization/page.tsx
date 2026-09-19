import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import {
  listItemsForPrioritization,
  type PrioritizationItem,
} from "@/features/prioritization/queries";
import {
  prioritizationFiltersSchema,
  PRIORITIZATION_SORTS,
  type PrioritizationFiltersValues,
} from "@/features/prioritization/schema";
import { canViewPrioritization } from "@/features/prioritization/permissions";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { listStatusesForOrganization } from "@/features/statuses/queries";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import { hasFeature } from "@/features/entitlements/queries";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { PrioritizationFilters } from "./prioritization-filters";
import { PageContainer, PageHeader } from "@/components/page-shell";

export const metadata: Metadata = { title: "Prioritisation" };

export default async function PrioritizationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const rawFilters = await searchParams;
  const { membership } = await requireOrganizationMembership(slug);
  if (!canViewPrioritization(membership.role)) notFound();

  const canUseAdvancedPrioritisation = await hasFeature(
    membership.organization.id,
    "advancedPrioritisation",
  );
  if (!canUseAdvancedPrioritisation) {
    return (
      <PageContainer>
        <PageHeader
          title="Prioritisation"
          description="Cross-board prioritisation — sorting and filtering every Item by votes, priority, status, type, category, and score — requires the Pro plan or higher."
          actions={
            <LinkButton href={`/org/${slug}/settings/billing`}>
              Upgrade
            </LinkButton>
          }
        />
      </PageContainer>
    );
  }

  const parsedFilters = prioritizationFiltersSchema.safeParse({
    itemType: rawFilters.itemType,
    status: rawFilters.status,
    category: rawFilters.category,
    sort: rawFilters.sort,
  });
  const filters: Partial<PrioritizationFiltersValues> = parsedFilters.success
    ? parsedFilters.data
    : {};

  const [items, itemTypes, statuses, categories] = await Promise.all([
    listItemsForPrioritization(membership.organization.id, {
      itemTypeSlug: filters.itemType,
      statusSlug: filters.status,
      categorySlug: filters.category,
      sort: filters.sort,
    }),
    listItemTypesForOrganization(membership.organization.id),
    listStatusesForOrganization(membership.organization.id),
    listCategoriesForOrganization(membership.organization.id),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Prioritisation"
        description="What should we consider next? Community signal (votes) and business signal (priority, score) side by side, across every board — never collapsed into one number."
      />

      <PrioritizationFilters
        basePath={`/org/${slug}/prioritization`}
        itemTypes={itemTypes}
        statuses={statuses}
        categories={categories}
        current={filters}
        sorts={PRIORITIZATION_SORTS}
      />

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No items match.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs">
                <th className="py-2 pr-2 font-medium">Item</th>
                <th className="py-2 pr-2 font-medium">Type</th>
                <th className="py-2 pr-2 font-medium">Status</th>
                <th className="py-2 pr-2 font-medium">Category</th>
                <th className="py-2 pr-2 font-medium">Priority</th>
                <th className="py-2 pr-2 text-right font-medium">Votes</th>
                <th className="py-2 pr-2 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <PrioritizationRow key={item.id} orgSlug={slug} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}

function PrioritizationRow({
  orgSlug,
  item,
}: {
  orgSlug: string;
  item: PrioritizationItem;
}) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-2">
        <Link
          href={`/org/${orgSlug}/boards/${item.board.slug}/items/${item.slug}`}
          className="hover:underline"
        >
          {item.title}
        </Link>
      </td>
      <td className="py-2 pr-2">
        <Badge variant="outline" className="text-xs">
          {item.itemType.name}
        </Badge>
      </td>
      <td className="py-2 pr-2">
        <Badge
          variant="secondary"
          className="text-xs"
          style={
            item.status.color
              ? {
                  backgroundColor: `${item.status.color}22`,
                  color: item.status.color,
                }
              : undefined
          }
        >
          {item.status.name}
        </Badge>
      </td>
      <td className="text-muted-foreground py-2 pr-2">
        {item.category?.name ?? "—"}
      </td>
      <td className="py-2 pr-2">
        {item.priority.slug !== "none" ? (
          <Badge
            variant="secondary"
            className="text-xs"
            style={
              item.priority.color
                ? {
                    backgroundColor: `${item.priority.color}22`,
                    color: item.priority.color,
                  }
                : undefined
            }
          >
            {item.priority.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-2 pr-2 text-right">{item._count.votes}</td>
      <td className="py-2 pr-2 text-right">
        {item.score !== null ? item.score.toFixed(1) : "—"}
      </td>
    </tr>
  );
}
