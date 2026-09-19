import { notFound } from "next/navigation";
import { requireBoardForOrgMember } from "@/features/boards/queries";
import { canManageBoards } from "@/features/boards/permissions";
import { RouteModal } from "@/components/route-modal";
import { Separator } from "@/components/ui/separator";
import { UpdateBoardForm } from "@/app/org/[slug]/boards/[boardSlug]/settings/update-board-form";
import { ArchiveBoardControl } from "@/app/org/[slug]/boards/[boardSlug]/settings/archive-board-control";

/** Intercepts `/org/[slug]/boards/[boardSlug]/settings` for a drawer —
 * see `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. */
export default async function BoardSettingsModal({
  params,
}: {
  params: Promise<{ slug: string; boardSlug: string }>;
}) {
  const { slug, boardSlug } = await params;
  const { membership, board } = await requireBoardForOrgMember(slug, boardSlug);
  if (!canManageBoards(membership.role)) notFound();

  return (
    <RouteModal title="Board settings" description={board.name}>
      <div className="space-y-8">
        <UpdateBoardForm
          orgSlug={slug}
          boardSlug={boardSlug}
          initialName={board.name}
          initialDescription={board.description ?? ""}
          initialVisibility={board.visibility}
        />

        <Separator />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">
            {board.status === "ARCHIVED" ? "Restore board" : "Archive board"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {board.status === "ARCHIVED"
              ? "This board is archived. Restoring it makes it visible again."
              : "Archiving hides this board from active views and the public page without deleting its items."}
          </p>
          <ArchiveBoardControl
            orgSlug={slug}
            boardSlug={boardSlug}
            archived={board.status === "ARCHIVED"}
          />
        </section>
      </div>
    </RouteModal>
  );
}
