import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicOrganization } from "@/features/organizations/public";
import { BrandStyle } from "@/components/public/brand-style";
import { PublicShell } from "@/components/public/public-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug } = await params;
  const organization = await getPublicOrganization(orgSlug);
  // The browser tab shows the organisation's logo when it has one.
  return organization?.logoUrl ? { icons: { icon: organization.logoUrl } } : {};
}

/** Everything under `/b/[orgSlug]` is the organisation's place: its accent
 * colour and top bar, whichever board or item the visitor is on. */
export default async function PublicOrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getPublicOrganization(orgSlug);
  if (!organization) notFound();

  return (
    <>
      <BrandStyle accentColor={organization.accentColor} />
      <PublicShell organization={organization}>{children}</PublicShell>
    </>
  );
}
