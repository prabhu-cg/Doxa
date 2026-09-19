import { FileText, Globe, Lock } from "lucide-react";
import { requireSpaceForOrgMember } from "@/features/spaces/queries";
import { canManageSpaces } from "@/features/spaces/permissions";
import { listBoardsForSpace } from "@/features/boards/queries";
import { canManageBoards } from "@/features/boards/permissions";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { EntityCard, EntityGrid, EntityMeta } from "@/components/entity-card";
import { getItemTerminology } from "@/features/organizations/terminology";
import { formatRelativeTime } from "@/lib/utils";

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string; spaceSlug: string }>;
}) {
  const { slug, spaceSlug } = await params;
  const { membership, space } = await requireSpaceForOrgMember(slug, spaceSlug);
  const boards = await listBoardsForSpace(space.id, { includeArchived: true });
  const terminology = getItemTerminology(membership.organization);

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
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
        <EntityGrid>
          {boards.map((board) => (
            <EntityCard
              key={board.id}
              href={`/org/${slug}/boards/${board.slug}`}
              title={board.name}
              badges={
                <>
                  <Badge
                    variant={
                      board.visibility === "PUBLIC" ? "info" : "secondary"
                    }
                  >
                    {board.visibility === "PUBLIC" ? <Globe /> : <Lock />}
                    {board.visibility === "PUBLIC" ? "Public" : "Private"}
                  </Badge>
                  {board.status === "ARCHIVED" ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : null}
                </>
              }
              description={board.description}
              meta={
                <EntityMeta icon={FileText}>
                  {board._count.items}{" "}
                  {board._count.items === 1
                    ? terminology.singular.toLowerCase()
                    : terminology.plural.toLowerCase()}
                </EntityMeta>
              }
              footer={`Updated ${formatRelativeTime(board.lastActivityAt)}`}
            />
          ))}
        </EntityGrid>
      )}
    </div>
  );
}
