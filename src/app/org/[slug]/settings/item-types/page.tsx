import type { Metadata } from "next";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { canManageItemTypes } from "@/features/item-types/permissions";
import { ItemTypeManager } from "./item-type-manager";

export const metadata: Metadata = { title: "Item types" };

export default async function ItemTypesSettingsPage({
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
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Item types</h1>
        <p className="text-muted-foreground text-sm">
          What kind of thing an Item is — Feature, Bug, Idea, or anything this
          organisation defines. Never hard-coded.
        </p>
      </div>
      <ItemTypeManager
        orgSlug={slug}
        itemTypes={itemTypes}
        canManage={canManageItemTypes(membership.role)}
      />
    </div>
  );
}
