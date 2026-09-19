import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listScoreCriteriaForOrganization } from "@/features/scoring/queries";
import { canManageScoreCriteria } from "@/features/scoring/permissions";
import { RouteModal } from "@/components/route-modal";
import { ScoreCriteriaManager } from "@/app/org/[slug]/settings/scoring/score-criteria-manager";

/** Intercepts `/org/[slug]/settings/scoring` for a drawer — see
 * `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. */
export default async function ScoringSettingsModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const criteria = await listScoreCriteriaForOrganization(
    membership.organization.id,
    { includeArchived: true },
  );

  return (
    <RouteModal
      title="Scoring criteria"
      description="Optional dimensions an Item can be scored against. Nothing is required, and with none configured the scoring panel doesn't appear on Items."
      size="lg"
    >
      <ScoreCriteriaManager
        orgSlug={slug}
        criteria={criteria}
        canManage={canManageScoreCriteria(membership.role)}
      />
    </RouteModal>
  );
}
