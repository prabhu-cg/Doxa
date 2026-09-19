import Link from "next/link";
import { db } from "@/server/db";
import { getAuthenticatedSupabaseUser } from "@/features/auth/queries";
import { getViewer } from "@/features/participation/access";
import type { Organization } from "@/generated/prisma/client";
import { ShellIdentity } from "./shell-identity";
import { PublicNav } from "./public-nav";
import { ViewerMenu } from "./viewer-menu";
import { publicBoardPath, publicRoadmapPath } from "@/lib/public-links";

/**
 * The chrome of every public page for an organisation: its identity and accent
 * in the top bar, tabs for its public boards and roadmap, who the visitor is,
 * and a small "Powered by Doxa" at the foot. Doxa's own mark is deliberately the
 * quietest thing on the page — this is the organisation's place.
 */
export async function PublicShell({
  organization,
  children,
}: {
  organization: Organization;
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedSupabaseUser();
  const [viewer, boards] = await Promise.all([
    getViewer(organization.id, user),
    db.board.findMany({
      where: {
        organizationId: organization.id,
        visibility: "PUBLIC",
        status: "ACTIVE",
      },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const tabs = [
    ...boards.map((board) => ({
      href: publicBoardPath(organization.slug, board.slug),
      label: board.name,
    })),
    ...(boards.length > 0
      ? [{ href: publicRoadmapPath(organization.slug), label: "Roadmap" }]
      : []),
  ];

  return (
    <div className="public-surface bg-background flex min-h-dvh flex-col">
      <header className="bg-background sticky top-0 z-30 border-b">
        <div aria-hidden="true" className="bg-primary h-[3px]" />
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <ShellIdentity
            name={organization.name}
            logoUrl={organization.logoUrl}
            size={30}
            className="shrink-0"
          />
          <PublicNav
            tabs={tabs}
            className="hidden min-w-0 overflow-x-auto md:flex"
          />
          <div className="ml-auto shrink-0">
            <ViewerMenu viewer={viewer} />
          </div>
        </div>
        <PublicNav
          tabs={tabs}
          className="mx-auto w-full max-w-[1400px] overflow-x-auto px-3 pb-2 md:hidden"
        />
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs sm:px-6 lg:px-8">
          <span>{organization.name}</span>
          <Link
            href="/"
            className="hover:text-foreground flex items-center gap-2 transition-colors"
          >
            Powered by
            <span className="text-foreground flex items-center gap-1.5 font-bold tracking-tight">
              {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG asset */}
              <img src="/doxa-logo.svg" alt="" className="size-4" />
              Doxa
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
