import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { settingsTrail } from "@/lib/breadcrumb-trails";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { canUpdateOrganization } from "@/features/organizations/permissions";
import { hasFeature } from "@/features/entitlements/queries";
import { BrandingForm } from "./branding-form";
import { TerminologyForm } from "./terminology-form";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Branding" };

export default async function BrandingSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const canEdit = canUpdateOrganization(membership.role);
  const canBrand = await hasFeature(membership.organization.id, "branding");

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      <div>
        <Breadcrumbs
          items={[...settingsTrail(slug), { label: "Branding" }]}
          className="mb-3"
        />
        <h1 className="text-2xl font-bold tracking-tight">Branding</h1>
        <p className="text-muted-foreground text-sm">
          How this organisation presents itself, including on its public boards.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Logo &amp; accent colour</h2>
          {!canBrand ? (
            <p className="text-muted-foreground text-sm">
              Custom branding requires the Pro plan or higher —{" "}
              <a className="underline" href={`/org/${slug}/settings/billing`}>
                upgrade
              </a>{" "}
              to set a logo and accent colour. Existing branding stays visible
              even without the entitlement.
            </p>
          ) : null}
        </div>
        {canEdit ? (
          <BrandingForm
            slug={slug}
            initialLogoUrl={membership.organization.logoUrl ?? ""}
            initialAccentColor={membership.organization.accentColor ?? ""}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            Only owners and admins can update branding.
          </p>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Terminology</h2>
          <p className="text-muted-foreground text-sm">
            What this organisation calls an Item — e.g. &quot;Ticket&quot;
            instead of &quot;Item&quot;.
          </p>
        </div>
        {canEdit ? (
          <TerminologyForm
            slug={slug}
            initialSingular={membership.organization.itemTerminologySingular}
            initialPlural={membership.organization.itemTerminologyPlural}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            Only owners and admins can update terminology.
          </p>
        )}
      </section>
    </div>
  );
}
