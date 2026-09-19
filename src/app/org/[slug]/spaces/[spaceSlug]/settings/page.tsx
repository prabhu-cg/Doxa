import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSpaceForOrgMember } from "@/features/spaces/queries";
import { canManageSpaces } from "@/features/spaces/permissions";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { spaceTrail } from "@/lib/breadcrumb-trails";
import { UpdateSpaceForm } from "./update-space-form";
import { ArchiveSpaceControl } from "./archive-space-control";

export const metadata: Metadata = { title: "Space settings" };

export default async function SpaceSettingsPage({
  params,
}: {
  params: Promise<{ slug: string; spaceSlug: string }>;
}) {
  const { slug, spaceSlug } = await params;
  const { membership, space } = await requireSpaceForOrgMember(slug, spaceSlug);
  if (!canManageSpaces(membership.role)) notFound();

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-10">
      <div>
        <Breadcrumbs
          items={[...spaceTrail(slug, space), { label: "Settings" }]}
          className="mb-3"
        />
        <h1 className="text-2xl font-bold tracking-tight">Space settings</h1>
        <p className="text-muted-foreground text-sm">{space.name}</p>
      </div>

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
  );
}
