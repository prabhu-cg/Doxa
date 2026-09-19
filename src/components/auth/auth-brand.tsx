import Link from "next/link";
import type { Organization } from "@/generated/prisma/client";
import { BrandStyle } from "@/components/public/brand-style";
import { OrgIdentity } from "@/components/public/org-identity";

/** The organisation a sign-in belongs to: its mark and name above the form, its
 * accent on the buttons, and Doxa's name only as a small line underneath. */
export function AuthBrand({ organization }: { organization: Organization }) {
  return (
    <>
      <BrandStyle accentColor={organization.accentColor} />
      <div className="mb-6 flex flex-col items-center gap-3 text-center sm:mb-8">
        <OrgIdentity
          name={organization.name}
          logoUrl={organization.logoUrl}
          size={48}
          className="flex-col !gap-3"
          nameClassName="text-xl"
        />
        <p className="text-muted-foreground text-sm">
          Vote, comment and share your ideas.
        </p>
      </div>
    </>
  );
}

export function AuthBrandFooter() {
  return (
    <p className="text-muted-foreground mt-6 text-center text-xs">
      Powered by{" "}
      <Link href="/" className="text-foreground font-bold hover:underline">
        Doxa
      </Link>
    </p>
  );
}
