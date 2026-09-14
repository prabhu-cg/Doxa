import Link from "next/link";
import { requireSpaceForOrgMember } from "@/features/spaces/queries";
import { canManageSpaces } from "@/features/spaces/permissions";
import { listBoardsForSpace } from "@/features/boards/queries";
import { canManageBoards } from "@/features/boards/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string; spaceSlug: string }>;
}) {
  const { slug, spaceSlug } = await params;
  const { membership, space } = await requireSpaceForOrgMember(slug, spaceSlug);
  const boards = await listBoardsForSpace(space.id, { includeArchived: true });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{space.name}</h1>
            {space.archivedAt ? (
              <Badge variant="secondary">Archived</Badge>
            ) : null}
          </div>
          {space.description ? (
            <p className="text-muted-foreground text-sm">{space.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {canManageBoards(membership.role) && !space.archivedAt ? (
            <LinkButton
              variant="outline"
              href={`/org/${slug}/boards/new?space=${space.slug}`}
            >
              New board
            </LinkButton>
          ) : null}
          {canManageSpaces(membership.role) ? (
            <LinkButton
              variant="outline"
              href={`/org/${slug}/spaces/${space.slug}/settings`}
            >
              Settings
            </LinkButton>
          ) : null}
        </div>
      </div>

      {boards.length === 0 ? (
        <p className="text-muted-foreground text-sm">No boards yet.</p>
      ) : (
        <div className="space-y-3">
          {boards.map((board) => (
            <Card key={board.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>
                    <Link href={`/org/${slug}/boards/${board.slug}`}>
                      {board.name}
                    </Link>
                  </CardTitle>
                  <Badge variant="outline">{board.visibility}</Badge>
                  {board.status === "ARCHIVED" ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : null}
                </div>
              </CardHeader>
              {board.description ? (
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {board.description}
                  </p>
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
