import { notFound } from "next/navigation";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { canManageSpaces } from "@/features/spaces/permissions";
import { RouteModal } from "@/components/route-modal";
import { CreateSpaceForm } from "@/app/org/[slug]/spaces/new/create-space-form";

/** Intercepts `/org/[slug]/spaces/new` for a drawer — see
 * `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. */
export default async function NewSpaceModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  if (!canManageSpaces(membership.role)) notFound();

  return (
    <RouteModal
      title="New space"
      description='A logical grouping of boards, like "Product" or "Engineering."'
    >
      <CreateSpaceForm orgSlug={slug} />
    </RouteModal>
  );
}
