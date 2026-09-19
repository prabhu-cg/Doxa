import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { canManageItemTypes } from "@/features/item-types/permissions";
import { RouteModal } from "@/components/route-modal";
import { ItemTypeManager } from "@/app/org/[slug]/settings/item-types/item-type-manager";

/** Intercepts `/org/[slug]/settings/item-types` for a drawer — see
 * `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. */
export default async function ItemTypesSettingsModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const itemTypes = await listItemTypesForOrganization(
    membership.organization.id,
    { includeArchived: true },
  );

  return (
    <RouteModal
      title="Item types"
      description="What kind of thing an Item is — Feature, Bug, Idea, or anything this organisation defines. Never hard-coded."
      size="lg"
    >
      <ItemTypeManager
        orgSlug={slug}
        itemTypes={itemTypes}
        canManage={canManageItemTypes(membership.role)}
      />
    </RouteModal>
  );
}
