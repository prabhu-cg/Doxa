import Link from "next/link";
import {
  listMembersForOrganization,
  requireOrganizationMembership,
} from "@/features/organizations/queries";
import { listSpacesForOrganization } from "@/features/spaces/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";

export default async function OrganizationDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const [members, spaces] = await Promise.all([
    listMembersForOrganization(membership.organization.id),
    listSpacesForOrganization(membership.organization.id),
  ]);

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
        <div className="flex shrink-0 gap-2">
          <LinkButton variant="outline" href={`/org/${slug}/boards`}>
            Boards
          </LinkButton>
          <LinkButton variant="outline" href={`/org/${slug}/settings`}>
            Settings
          </LinkButton>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Spaces</h2>
        <LinkButton size="sm" variant="ghost" href={`/org/${slug}/spaces`}>
          View all
        </LinkButton>
      </div>

      {spaces.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              No spaces yet.{" "}
              <Link className="underline" href={`/org/${slug}/spaces/new`}>
                Create one
              </Link>{" "}
              to start organising boards.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {spaces.map((space) => (
            <Card key={space.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/org/${slug}/spaces/${space.slug}`}>
                    {space.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {space._count.boards} board
                  {space._count.boards === 1 ? "" : "s"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
