import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireBoardForOrgMember } from "@/features/boards/queries";
import { canManageBoards } from "@/features/boards/permissions";
import { Separator } from "@/components/ui/separator";
import { PublicLinkField } from "@/components/public-link";
import { publicBoardPath } from "@/lib/public-links";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { boardTrail } from "@/lib/breadcrumb-trails";
import { UpdateBoardForm } from "./update-board-form";
import { ArchiveBoardControl } from "./archive-board-control";

export const metadata: Metadata = { title: "Board settings" };

export default async function BoardSettingsPage({
  params,
}: {
  params: Promise<{ slug: string; boardSlug: string }>;
}) {
  const { slug, boardSlug } = await params;
  const { membership, board } = await requireBoardForOrgMember(slug, boardSlug);
  if (!canManageBoards(membership.role)) notFound();

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-10">
      <div>
        <Breadcrumbs
          items={[...boardTrail(slug, board), { label: "Settings" }]}
          className="mb-3"
        />
        <h1 className="text-2xl font-bold tracking-tight">Board settings</h1>
        <p className="text-muted-foreground text-sm">{board.name}</p>
      </div>

      <UpdateBoardForm
        orgSlug={slug}
        boardSlug={boardSlug}
        initialName={board.name}
        initialDescription={board.description ?? ""}
        initialVisibility={board.visibility}
      />

      {board.visibility === "PUBLIC" && board.status === "ACTIVE" ? (
        <>
          <Separator />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Public link</h2>
            <p className="text-muted-foreground text-sm">
              Anyone with this link can browse this board — no account needed.
              Share it anywhere.
            </p>
            <PublicLinkField path={publicBoardPath(slug, boardSlug)} />
          </section>
        </>
      ) : null}

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
  );
}
