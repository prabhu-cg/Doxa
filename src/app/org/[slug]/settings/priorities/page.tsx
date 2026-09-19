import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { settingsTrail } from "@/lib/breadcrumb-trails";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listPrioritiesForOrganization } from "@/features/priorities/queries";
import { canManagePriorities } from "@/features/priorities/permissions";
import { PriorityManager } from "./priority-manager";

export const metadata: Metadata = { title: "Priorities" };

export default async function PrioritiesSettingsPage({
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
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <Breadcrumbs
          items={[...settingsTrail(slug), { label: "Priorities" }]}
          className="mb-3"
        />
        <h1 className="text-2xl font-bold tracking-tight">Priorities</h1>
        <p className="text-muted-foreground text-sm">
          The levels this organisation triages Items with — None, Low, Medium,
          High, Critical by default. A vote count is never a priority; priority
          is set here, explicitly, by the organisation.
        </p>
      </div>
      <PriorityManager
        orgSlug={slug}
        priorities={priorities}
        canManage={canManagePriorities(membership.role)}
      />
    </div>
  );
}
