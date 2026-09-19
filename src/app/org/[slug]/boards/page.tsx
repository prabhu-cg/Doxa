import type { Metadata } from "next";
import { FileText, Globe, Lock } from "lucide-react";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listBoardsForOrganization } from "@/features/boards/queries";
import { canManageBoards } from "@/features/boards/permissions";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { EntityCard, EntityGrid, EntityMeta } from "@/components/entity-card";
import { getItemTerminology } from "@/features/organizations/terminology";
import { formatRelativeTime } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/page-shell";

export const metadata: Metadata = { title: "Boards" };

export default async function BoardsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const boards = await listBoardsForOrganization(membership.organization.id, {
    includeArchived: true,
  });
  const terminology = getItemTerminology(membership.organization);

  return (
    <PageContainer>
      <PageHeader
        title="Boards"
        description={
          'A Board is where people submit and browse Items for one specific area of feedback — e.g. "Mobile bugs" or "Feature requests". Boards live inside a Space and can be Public (anyone with the link) or Private (members only).'
        }
        actions={
          canManageBoards(membership.role) ? (
            <LinkButton href={`/org/${slug}/boards/new`}>New board</LinkButton>
          ) : undefined
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
              subtitle={board.space.name}
              description={board.description}
              meta={
                <>
                  <EntityMeta icon={FileText}>
                    {board._count.items}{" "}
                    {board._count.items === 1
                      ? terminology.singular.toLowerCase()
                      : terminology.plural.toLowerCase()}
                  </EntityMeta>
                </>
              }
              footer={`Updated ${formatRelativeTime(board.lastActivityAt)}`}
            />
          ))}
        </EntityGrid>
      )}
    </PageContainer>
  );
}
