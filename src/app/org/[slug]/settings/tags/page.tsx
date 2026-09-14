import type { Metadata } from "next";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listTagsForOrganization } from "@/features/tags/queries";
import { canManageTags } from "@/features/tags/permissions";
import { TagManager } from "./tag-manager";

export const metadata: Metadata = { title: "Tags" };

export default async function TagsSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const tags = await listTagsForOrganization(membership.organization.id);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
        <p className="text-muted-foreground text-sm">
          Free-form labels. Items can have multiple — authors can also create
          new ones directly while submitting an Item.
        </p>
      </div>
      <TagManager
        orgSlug={slug}
        tags={tags}
        canManage={canManageTags(membership.role)}
      />
    </div>
  );
}
