import { requireOrganizationMembership } from "@/features/organizations/queries";
import { RouteModal } from "@/components/route-modal";
import { HelpContent } from "@/app/org/[slug]/help/help-content";

/** Intercepts `/org/[slug]/help` for a drawer — see
 * `src/app/org/[slug]/@modal/default.tsx` for why a direct link or a
 * refresh still renders the real page. */
export default async function HelpModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOrganizationMembership(slug);

  return (
    <RouteModal
      title="Help"
      description="What Doxa's pieces are and how they fit together."
      size="lg"
    >
      <HelpContent />
    </RouteModal>
  );
}
