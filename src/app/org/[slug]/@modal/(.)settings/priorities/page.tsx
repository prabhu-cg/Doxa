import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listPrioritiesForOrganization } from "@/features/priorities/queries";
import { canManagePriorities } from "@/features/priorities/permissions";
import { RouteModal } from "@/components/route-modal";
import { PriorityManager } from "@/app/org/[slug]/settings/priorities/priority-manager";

/** Intercepts `/org/[slug]/settings/priorities` for a drawer — see
 * `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. */
export default async function PrioritiesSettingsModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const priorities = await listPrioritiesForOrganization(
    membership.organization.id,
    { includeArchived: true },
  );

  return (
    <RouteModal
      title="Priorities"
      description="The levels this organisation triages Items with. A vote count is never a priority — it's set here, explicitly."
      size="lg"
    >
      <PriorityManager
        orgSlug={slug}
        priorities={priorities}
        canManage={canManagePriorities(membership.role)}
      />
    </RouteModal>
  );
}
