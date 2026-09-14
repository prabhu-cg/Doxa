import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listSpacesForOrganization } from "@/features/spaces/queries";
import { canManageSpaces } from "@/features/spaces/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";

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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
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
        <div className="space-y-3">
          {spaces.map((space) => (
            <Card key={space.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>
                    <Link href={`/org/${slug}/spaces/${space.slug}`}>
                      {space.name}
                    </Link>
                  </CardTitle>
                  {space.archivedAt ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {space._count.boards} board
                  {space._count.boards === 1 ? "" : "s"}
                  {space.description ? ` · ${space.description}` : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
