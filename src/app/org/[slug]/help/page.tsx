import type { Metadata } from "next";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { PageHeader } from "@/components/page-shell";
import { HelpContent } from "./help-content";

export const metadata: Metadata = { title: "Help" };

export default async function HelpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOrganizationMembership(slug);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="Help"
        description="What Doxa's pieces are and how they fit together."
      />
      <HelpContent />
    </div>
  );
}
