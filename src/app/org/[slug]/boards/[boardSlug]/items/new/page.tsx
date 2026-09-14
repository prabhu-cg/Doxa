import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBoardForOrgMember } from "@/features/boards/queries";
import { canCreateItem } from "@/features/items/permissions";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import { CreateItemForm } from "./create-item-form";

export const metadata: Metadata = { title: "New item" };

export default async function NewItemPage({
  params,
}: {
  params: Promise<{ slug: string; boardSlug: string }>;
}) {
  const { slug, boardSlug } = await params;
  const { membership, board } = await requireBoardForOrgMember(slug, boardSlug);
  if (!canCreateItem(membership.role) || board.status === "ARCHIVED") {
    notFound();
  }

  const [itemTypes, categories] = await Promise.all([
    listItemTypesForOrganization(membership.organization.id),
    listCategoriesForOrganization(membership.organization.id),
  ]);

  if (itemTypes.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight">New item</h1>
        <p className="text-muted-foreground text-sm">
          This organisation has no active item types configured yet. Add one in{" "}
          <Link className="underline" href={`/org/${slug}/settings/item-types`}>
            item type settings
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New item</h1>
        <p className="text-muted-foreground text-sm">on {board.name}</p>
      </div>
      <CreateItemForm
        orgSlug={slug}
        boardSlug={boardSlug}
        itemTypes={itemTypes.map((t) => ({ id: t.id, name: t.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
