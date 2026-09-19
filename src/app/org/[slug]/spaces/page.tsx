import type { Metadata } from "next";
import { FileText, KanbanSquare } from "lucide-react";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listSpacesForOrganization } from "@/features/spaces/queries";
import { canManageSpaces } from "@/features/spaces/permissions";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { EntityCard, EntityGrid, EntityMeta } from "@/components/entity-card";
import { getItemTerminology } from "@/features/organizations/terminology";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Spaces" };

export default async function SpacesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const spaces = await listSpacesForOrganization(membership.organization.id, {
    includeArchived: true,
  });
  const terminology = getItemTerminology(membership.organization);

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spaces</h1>
          <p className="text-muted-foreground text-sm">
            Logical groupings of boards, like &quot;Product&quot; or
            &quot;Customer Feedback.&quot;
          </p>
        </div>
        {canManageSpaces(membership.role) ? (
          <LinkButton href={`/org/${slug}/spaces/new`}>New space</LinkButton>
        ) : null}
      </div>

      {spaces.length === 0 ? (
        <p className="text-muted-foreground text-sm">No spaces yet.</p>
      ) : (
        <EntityGrid>
          {spaces.map((space) => (
            <EntityCard
              key={space.id}
              href={`/org/${slug}/spaces/${space.slug}`}
              title={space.name}
              badges={
                space.archivedAt ? (
                  <Badge variant="secondary">Archived</Badge>
                ) : undefined
              }
              description={space.description}
              meta={
                <>
                  <EntityMeta icon={KanbanSquare}>
                    {space._count.boards}{" "}
                    {space._count.boards === 1 ? "board" : "boards"}
                  </EntityMeta>
                  <EntityMeta icon={FileText}>
                    {space._count.items}{" "}
                    {space._count.items === 1
                      ? terminology.singular.toLowerCase()
                      : terminology.plural.toLowerCase()}
                  </EntityMeta>
                </>
              }
              footer={`Updated ${formatRelativeTime(space.lastActivityAt)}`}
            />
          ))}
        </EntityGrid>
      )}
    </div>
  );
}
