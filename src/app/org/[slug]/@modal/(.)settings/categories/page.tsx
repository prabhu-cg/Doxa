import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import { canManageCategories } from "@/features/categories/permissions";
import { RouteModal } from "@/components/route-modal";
import { CategoryManager } from "@/app/org/[slug]/settings/categories/category-manager";

/** Intercepts `/org/[slug]/settings/categories` for a drawer — see
 * `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. */
export default async function CategoriesSettingsModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const categories = await listCategoriesForOrganization(
    membership.organization.id,
  );

  return (
    <RouteModal
      title="Categories"
      description="A single classification an Item can belong to. Deleting one just removes it from any Items that had it."
      size="lg"
    >
      <CategoryManager
        orgSlug={slug}
        categories={categories}
        canManage={canManageCategories(membership.role)}
      />
    </RouteModal>
  );
}
