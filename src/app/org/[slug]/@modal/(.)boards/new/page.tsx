import { notFound } from "next/navigation";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listSpacesForOrganization } from "@/features/spaces/queries";
import { canManageBoards } from "@/features/boards/permissions";
import { RouteModal } from "@/components/route-modal";
import { CreateBoardForm } from "@/app/org/[slug]/boards/new/create-board-form";

/**
 * Intercepts client-side navigation to `/org/[slug]/boards/new` and
 * shows it as a drawer instead — see
 * `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. Fetches exactly what the real
 * page fetches; the two are kept deliberately parallel rather than
 * sharing a data-fetching function, since Next.js intercepted routes
 * are separate page modules by design.
 */
export default async function NewBoardModal({
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

  const spaces = await listSpacesForOrganization(membership.organization.id);

  if (spaces.length === 0) {
    return (
      <RouteModal title="New board">
        <p className="text-muted-foreground text-sm">
          Create a space first — boards live inside a space.
        </p>
      </RouteModal>
    );
  }

  const preselectedSpaceId = spaces.find(
    (space) => space.slug === preselectedSpaceSlug,
  )?.id;

  return (
    <RouteModal
      title="New board"
      description="Where Items will be submitted and browsed for one specific area of feedback."
    >
      <CreateBoardForm
        orgSlug={slug}
        spaces={spaces.map((s) => ({ id: s.id, name: s.name }))}
        initialSpaceId={preselectedSpaceId}
      />
    </RouteModal>
  );
}
