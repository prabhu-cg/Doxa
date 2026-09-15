import type { Metadata } from "next";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listScoreCriteriaForOrganization } from "@/features/scoring/queries";
import { canManageScoreCriteria } from "@/features/scoring/permissions";
import { ScoreCriteriaManager } from "./score-criteria-manager";

export const metadata: Metadata = { title: "Scoring criteria" };

export default async function ScoringSettingsPage({
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
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scoring criteria</h1>
        <p className="text-muted-foreground text-sm">
          Optional dimensions (customer impact, business value, strategic
          alignment, effort, urgency, confidence, or anything else this
          organisation cares about) an Item can be scored against. Nothing here
          is required — an Item is never forced to be scored on every dimension,
          and if this list is empty, the scoring panel simply does not appear on
          Items.
        </p>
      </div>
      <ScoreCriteriaManager
        orgSlug={slug}
        criteria={criteria}
        canManage={canManageScoreCriteria(membership.role)}
      />
    </div>
  );
}
