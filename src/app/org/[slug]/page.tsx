import {
  listMembersForOrganization,
  requireOrganizationMembership,
} from "@/features/organizations/queries";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";

export default async function OrganizationDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const members = await listMembersForOrganization(membership.organization.id);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {membership.organization.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {members.length} member{members.length === 1 ? "" : "s"} · your
            role: <Badge variant="secondary">{membership.role}</Badge>
          </p>
        </div>
        <LinkButton variant="outline" href={`/org/${slug}/settings`}>
          Settings
        </LinkButton>
      </div>
      <p className="text-muted-foreground text-sm">
        Spaces, boards and items begin in Phase 2 — this is just the
        organisation home for now.
      </p>
    </div>
  );
}
