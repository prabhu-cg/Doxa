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
import { PageContainer, PageHeader } from "@/components/page-shell";

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
    <PageContainer>
      <PageHeader
        title={space.name}
        badges={
          space.archivedAt ? <Badge variant="secondary">Archived</Badge> : null
        }
        description={space.description}
        actions={
          <>
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
          </>
        }
      />

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
    </PageContainer>
  );
}
