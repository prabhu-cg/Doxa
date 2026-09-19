import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { settingsTrail } from "@/lib/breadcrumb-trails";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import { canManageCategories } from "@/features/categories/permissions";
import { CategoryManager } from "./category-manager";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesSettingsPage({
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
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <Breadcrumbs
          items={[...settingsTrail(slug), { label: "Categories" }]}
          className="mb-3"
        />
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground text-sm">
          A single classification an Item can belong to. Deleting one just
          removes it from any Items that had it.
        </p>
      </div>
      <CategoryManager
        orgSlug={slug}
        categories={categories}
        canManage={canManageCategories(membership.role)}
      />
    </div>
  );
}
