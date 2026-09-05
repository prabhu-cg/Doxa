import { redirect } from "next/navigation";
import { requireCurrentProfile } from "@/features/profile/queries";
import { listMembershipsForUser } from "@/features/organizations/queries";

export default async function RootPage() {
  const profile = await requireCurrentProfile();
  const memberships = await listMembershipsForUser(profile.id);

  if (memberships.length === 0) redirect("/onboarding");
  redirect(`/org/${memberships[0].organization.slug}`);
}
