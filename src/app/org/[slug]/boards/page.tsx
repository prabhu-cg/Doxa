import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listBoardsForOrganization } from "@/features/boards/queries";
import { canManageBoards } from "@/features/boards/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";

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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Boards</h1>
          <p className="text-muted-foreground text-sm">
            Where Items are submitted, across every space.
          </p>
        </div>
        {canManageBoards(membership.role) ? (
          <LinkButton href={`/org/${slug}/boards/new`}>New board</LinkButton>
        ) : null}
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
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {board.space.name}
                  {board.description ? ` · ${board.description}` : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
