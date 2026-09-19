import { redirect } from "next/navigation";
import { requireOrganizationMembership } from "@/features/organizations/queries";

/** An organisation's landing page is its Spaces. There's no separate
 * dashboard: it would only repeat the Spaces list. The membership check
 * comes first so a non-member still gets the indistinguishable 404. */
export default async function OrganizationHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOrganizationMembership(slug);
  redirect(`/org/${slug}/spaces`);
}
