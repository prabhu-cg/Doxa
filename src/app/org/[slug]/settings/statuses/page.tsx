import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { settingsTrail } from "@/lib/breadcrumb-trails";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listStatusesForOrganization } from "@/features/statuses/queries";
import { canManageStatuses } from "@/features/statuses/permissions";
import { StatusManager } from "./status-manager";

export const metadata: Metadata = { title: "Statuses" };

export default async function StatusesSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const statuses = await listStatusesForOrganization(
    membership.organization.id,
    {
      includeArchived: true,
    },
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <Breadcrumbs
          items={[...settingsTrail(slug), { label: "Statuses" }]}
          className="mb-3"
        />
        <h1 className="text-2xl font-bold tracking-tight">Statuses</h1>
        <p className="text-muted-foreground text-sm">
          The workflow an Item moves through — Open, Planned, Completed, or
          anything this organisation defines. The default status is where a new
          Item starts.
        </p>
      </div>
      <StatusManager
        orgSlug={slug}
        statuses={statuses}
        canManage={canManageStatuses(membership.role)}
      />
    </div>
  );
}
