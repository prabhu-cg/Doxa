import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBoardForOrgMember } from "@/features/boards/queries";
import { canCreateItem } from "@/features/items/permissions";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import { getItemTerminology } from "@/features/organizations/terminology";
import { RouteModal } from "@/components/route-modal";
import { CreateItemForm } from "@/app/org/[slug]/boards/[boardSlug]/items/new/create-item-form";

/** Intercepts `/org/[slug]/boards/[boardSlug]/items/new` for a drawer —
 * see `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. Fetches exactly what the real page
 * fetches, kept parallel rather than shared (see the `boards/new` drawer). */
export default async function NewItemModal({
  params,
}: {
  params: Promise<{ slug: string; boardSlug: string }>;
}) {
  const { slug, boardSlug } = await params;
  const { membership, board } = await requireBoardForOrgMember(slug, boardSlug);
  if (!canCreateItem(membership.role) || board.status === "ARCHIVED") {
    notFound();
  }

  const terminology = getItemTerminology(membership.organization);
  const title = `New ${terminology.singular}`;

  const [itemTypes, categories] = await Promise.all([
    listItemTypesForOrganization(membership.organization.id),
    listCategoriesForOrganization(membership.organization.id),
  ]);

  if (itemTypes.length === 0) {
    return (
      <RouteModal title={title} description={`on ${board.name}`}>
        <p className="text-muted-foreground text-sm">
          This organisation has no active item types configured yet. Add one in{" "}
          <Link className="underline" href={`/org/${slug}/settings/item-types`}>
            item type settings
          </Link>
          .
        </p>
      </RouteModal>
    );
  }

  return (
    <RouteModal title={title} description={`on ${board.name}`}>
      <CreateItemForm
        orgSlug={slug}
        boardSlug={boardSlug}
        itemTypes={itemTypes.map((t) => ({ id: t.id, name: t.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </RouteModal>
  );
}
