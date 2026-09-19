import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicRoadmap } from "@/features/roadmap/public";
import type { PublicRoadmapItem } from "@/features/roadmap/public";
import {
  ROADMAP_STAGES,
  ROADMAP_STAGE_LABELS,
} from "@/features/decisions/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { formatDate } from "@/lib/format-date";
import { OrgIdentity } from "@/components/public/org-identity";
import { publicBoardPath, publicItemPath } from "@/lib/public-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug } = await params;
  const roadmap = await getPublicRoadmap(orgSlug);
  if (!roadmap) return {};
  return {
    title: `Roadmap · ${roadmap.organization.name}`,
    description: `What ${roadmap.organization.name} is working on, what's next, and what has shipped — with the reasons behind each decision.`,
  };
}

export default async function PublicRoadmapPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const roadmap = await getPublicRoadmap(orgSlug);
  if (!roadmap) notFound();
  const { organization, boards, stages, shipped } = roadmap;

  const isEmpty =
    shipped.length === 0 && ROADMAP_STAGES.every((s) => stages[s].length === 0);

  return (
    <>
      <section
        aria-label="About the roadmap"
        className="border-b bg-[color-mix(in_srgb,var(--primary)_5%,white)]"
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-start gap-4 px-4 py-8 sm:gap-5 sm:px-6 lg:px-8">
          <OrgIdentity
            markOnly
            name={organization.name}
            logoUrl={organization.logoUrl}
            size={48}
            className="shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-[28px] leading-tight font-bold tracking-tight">
              Roadmap
            </h1>
            <p className="text-foreground/75 mt-1.5 max-w-prose text-[15px] leading-6">
              What {organization.name} is working on, what&apos;s next, and what
              has shipped. Every item links to the reasoning behind the
              decision.
            </p>
            <p className="text-muted-foreground mt-3 text-sm">
              Share an idea or see what others asked for:{" "}
              {boards.map((board, index) => (
                <span key={board.slug}>
                  {index > 0 ? " · " : ""}
                  <Link
                    href={publicBoardPath(orgSlug, board.slug)}
                    className="text-primary-text font-semibold underline-offset-4 hover:underline"
                  >
                    {board.name}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1400px] space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {isEmpty ? (
          <p className="text-muted-foreground text-sm">
            Nothing on the roadmap yet — check back soon.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {ROADMAP_STAGES.map((stage) => (
                <section key={stage} className="space-y-3">
                  <h2 className="text-sm font-semibold">
                    {ROADMAP_STAGE_LABELS[stage]}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({stages[stage].length})
                    </span>
                  </h2>
                  {stages[stage].length === 0 ? (
                    <p className="text-muted-foreground text-xs">
                      Nothing here yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stages[stage].map((item) => (
                        <RoadmapCard
                          key={item.id}
                          orgSlug={orgSlug}
                          item={item}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {shipped.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold">Recently shipped</h2>
                <ul className="divide-y border-y">
                  {shipped.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                    >
                      <Link
                        href={publicItemPath(
                          orgSlug,
                          item.boardSlug,
                          item.slug,
                        )}
                        className="text-sm font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                      <span className="text-muted-foreground text-xs">
                        {item.votes} {item.votes === 1 ? "vote" : "votes"} ·
                        shipped {formatRelativeTime(item.decidedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

function RoadmapCard({
  orgSlug,
  item,
}: {
  orgSlug: string;
  item: PublicRoadmapItem;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          <Link
            href={publicItemPath(orgSlug, item.boardSlug, item.slug)}
            className="hover:underline"
          >
            {item.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge variant="outline" className="text-xs">
          {item.itemTypeName}
        </Badge>
        <p className="text-muted-foreground line-clamp-3 text-xs">
          {item.rationale}
        </p>
        <p className="text-muted-foreground text-xs">
          {item.votes} {item.votes === 1 ? "vote" : "votes"}
          {item.targetDate ? ` · target ${formatDate(item.targetDate)}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}
