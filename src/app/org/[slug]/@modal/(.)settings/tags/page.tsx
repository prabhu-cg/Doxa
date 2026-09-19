import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listTagsForOrganization } from "@/features/tags/queries";
import { canManageTags } from "@/features/tags/permissions";
import { RouteModal } from "@/components/route-modal";
import { TagManager } from "@/app/org/[slug]/settings/tags/tag-manager";

/** Intercepts `/org/[slug]/settings/tags` for a drawer — see
 * `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. */
export default async function TagsSettingsModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const tags = await listTagsForOrganization(membership.organization.id);

  return (
    <RouteModal
      title="Tags"
      description="Free-form labels. Items can have multiple — authors can also create new ones directly while submitting an Item."
      size="lg"
    >
      <TagManager
        orgSlug={slug}
        tags={tags}
        canManage={canManageTags(membership.role)}
      />
    </RouteModal>
  );
}
