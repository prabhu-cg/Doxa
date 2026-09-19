import { notFound } from "next/navigation";
import { requireSpaceForOrgMember } from "@/features/spaces/queries";
import { canManageSpaces } from "@/features/spaces/permissions";
import { RouteModal } from "@/components/route-modal";
import { Separator } from "@/components/ui/separator";
import { UpdateSpaceForm } from "@/app/org/[slug]/spaces/[spaceSlug]/settings/update-space-form";
import { ArchiveSpaceControl } from "@/app/org/[slug]/spaces/[spaceSlug]/settings/archive-space-control";

/** Intercepts `/org/[slug]/spaces/[spaceSlug]/settings` for a drawer —
 * see `src/app/org/[slug]/@modal/default.tsx`. */
export default async function SpaceSettingsModal({
  params,
}: {
  params: Promise<{ slug: string; spaceSlug: string }>;
}) {
  const { slug, spaceSlug } = await params;
  const { membership, space } = await requireSpaceForOrgMember(slug, spaceSlug);
  if (!canManageSpaces(membership.role)) notFound();

  return (
    <RouteModal title="Space settings" description={space.name}>
      <div className="space-y-8">
        <UpdateSpaceForm
          orgSlug={slug}
          spaceSlug={spaceSlug}
          initialName={space.name}
          initialDescription={space.description ?? ""}
        />

        <Separator />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">
            {space.archivedAt ? "Restore space" : "Archive space"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {space.archivedAt
              ? "This space is archived. Restoring it makes it visible again."
              : "Archiving hides this space and its boards from active views without deleting anything."}
          </p>
          <ArchiveSpaceControl
            orgSlug={slug}
            spaceSlug={spaceSlug}
            archived={!!space.archivedAt}
          />
        </section>
      </div>
    </RouteModal>
  );
}
