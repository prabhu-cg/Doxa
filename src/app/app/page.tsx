import { redirect } from "next/navigation";
import { requireCurrentProfile } from "@/features/profile/queries";
import { listMembershipsForUser } from "@/features/organizations/queries";

/**
 * The authenticated app's entry point. Signed-in users land here (from
 * login, or by visiting /app directly) and are routed to their
 * onboarding or their first organisation. Kept separate from `/`, which
 * is the public marketing homepage — see docs/architecture.md.
 */
export default async function AppEntryPage() {
  const profile = await requireCurrentProfile();
  const memberships = await listMembershipsForUser(profile.id);

  if (memberships.length === 0) redirect("/onboarding");
  redirect(`/org/${memberships[0].organization.slug}`);
}
