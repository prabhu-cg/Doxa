import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listStatusesForOrganization } from "@/features/statuses/queries";
import { canManageStatuses } from "@/features/statuses/permissions";
import { RouteModal } from "@/components/route-modal";
import { StatusManager } from "@/app/org/[slug]/settings/statuses/status-manager";

/** Intercepts `/org/[slug]/settings/statuses` for a drawer — see
 * `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. */
export default async function StatusesSettingsModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const statuses = await listStatusesForOrganization(
    membership.organization.id,
    { includeArchived: true },
  );

  return (
    <RouteModal
      title="Statuses"
      description="The workflow an Item moves through — Open, Planned, Completed, or anything this organisation defines. The default status is where a new Item starts."
      size="lg"
    >
      <StatusManager
        orgSlug={slug}
        statuses={statuses}
        canManage={canManageStatuses(membership.role)}
      />
    </RouteModal>
  );
}
