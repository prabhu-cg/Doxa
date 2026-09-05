import Link from "next/link";
import { OrgSwitcher } from "@/components/org-switcher";
import { UserMenu } from "@/components/user-menu";

type OrgOption = { slug: string; name: string };

export function AppShell({
  currentOrganization,
  organizations,
  displayName,
  children,
}: {
  currentOrganization: OrgOption;
  organizations: OrgOption[];
  displayName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link href="/app" className="text-lg font-extrabold tracking-tight">
            Doxa
          </Link>
          <OrgSwitcher current={currentOrganization} options={organizations} />
        </div>
        <UserMenu displayName={displayName} />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
