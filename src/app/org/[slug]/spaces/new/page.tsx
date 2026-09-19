import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { canManageSpaces } from "@/features/spaces/permissions";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { spacesTrail } from "@/lib/breadcrumb-trails";
import { CreateSpaceForm } from "./create-space-form";

export const metadata: Metadata = { title: "New space" };

export default async function NewSpacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  if (!canManageSpaces(membership.role)) notFound();

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-10">
      <div>
        <Breadcrumbs
          items={[...spacesTrail(slug), { label: "New space" }]}
          className="mb-3"
        />
        <h1 className="text-2xl font-bold tracking-tight">New space</h1>
        <p className="text-muted-foreground text-sm">
          A logical grouping of boards, like &quot;Product&quot; or
          &quot;Engineering.&quot;
        </p>
      </div>
      <CreateSpaceForm orgSlug={slug} />
    </div>
  );
}
