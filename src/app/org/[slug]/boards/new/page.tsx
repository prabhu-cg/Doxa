import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listSpacesForOrganization } from "@/features/spaces/queries";
import { canManageBoards } from "@/features/boards/permissions";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { boardsTrail } from "@/lib/breadcrumb-trails";
import { CreateBoardForm } from "./create-board-form";

export const metadata: Metadata = { title: "New board" };

export default async function NewBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ space?: string }>;
}) {
  const { slug } = await params;
  const { space: preselectedSpaceSlug } = await searchParams;
  const { membership } = await requireOrganizationMembership(slug);
  if (!canManageBoards(membership.role)) notFound();

  const trail = [...boardsTrail(slug), { label: "New board" }];
  const spaces = await listSpacesForOrganization(membership.organization.id);
  if (spaces.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 px-4 py-10">
        <div>
          <Breadcrumbs items={trail} className="mb-3" />
          <h1 className="text-2xl font-bold tracking-tight">New board</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Create a space first — boards live inside a space.
        </p>
      </div>
    );
  }

  const preselectedSpaceId = spaces.find(
    (space) => space.slug === preselectedSpaceSlug,
  )?.id;

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-10">
      <div>
        <Breadcrumbs items={trail} className="mb-3" />
        <h1 className="text-2xl font-bold tracking-tight">New board</h1>
        <p className="text-muted-foreground text-sm">
          Where Items will be submitted and browsed.
        </p>
      </div>
      <CreateBoardForm
        orgSlug={slug}
        spaces={spaces.map((s) => ({ id: s.id, name: s.name }))}
        initialSpaceId={preselectedSpaceId}
      />
    </div>
  );
}
