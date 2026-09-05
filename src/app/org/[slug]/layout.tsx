import {
  listMembershipsForUser,
  requireOrganizationMembership,
} from "@/features/organizations/queries";
import { AppShell } from "@/components/app-shell";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { profile, membership } = await requireOrganizationMembership(slug);
  const memberships = await listMembershipsForUser(profile.id);

  return (
    <AppShell
      currentOrganization={{
        slug: membership.organization.slug,
        name: membership.organization.name,
      }}
      organizations={memberships.map((m) => ({
        slug: m.organization.slug,
        name: m.organization.name,
      }))}
      displayName={profile.displayName}
    >
      {children}
    </AppShell>
  );
}
