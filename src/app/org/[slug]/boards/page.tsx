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
    <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Boards</h1>
          <p className="text-muted-foreground text-sm">
            A Board is where people submit and browse Items for one specific
            area of feedback — e.g. &quot;Mobile bugs&quot; or &quot;Feature
            requests&quot;. Boards live inside a Space and can be Public (anyone
            with the link) or Private (members only).
          </p>
        </div>
        {canManageBoards(membership.role) ? (
          <LinkButton href={`/org/${slug}/boards/new`}>New board</LinkButton>
        ) : null}
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
    </div>
  );
}
