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
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-10">
      <header className="space-y-2">
        <Link
          href="/"
          className="text-muted-foreground text-sm font-semibold tracking-tight"
        >
          Doxa
        </Link>
        <div className="flex items-center gap-2">
          {organization.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external, org-supplied URL; not a static/local asset next/image can optimize.
            <img
              src={organization.logoUrl}
              alt={`${organization.name} logo`}
              className="size-6 rounded object-contain"
            />
          ) : null}
          <h1
            className="text-2xl font-bold tracking-tight"
            style={
              organization.accentColor
                ? { color: organization.accentColor }
                : undefined
            }
          >
            Roadmap
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm">
          {organization.name} · What we&apos;re working on, what&apos;s next,
          and what has shipped. Every card links to the reasoning behind the
          decision.
        </p>
        <p className="text-muted-foreground text-sm">
          Share an idea or see what others asked for:{" "}
          {boards.map((board, index) => (
            <span key={board.slug}>
              {index > 0 ? " · " : ""}
              <Link
                href={publicBoardPath(orgSlug, board.slug)}
                className="text-foreground underline underline-offset-4"
              >
                {board.name}
              </Link>
            </span>
          ))}
        </p>
      </header>

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
                      href={publicItemPath(orgSlug, item.boardSlug, item.slug)}
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
          {item.targetDate
            ? ` · target ${item.targetDate.toLocaleDateString()}`
            : ""}
        </p>
      </CardContent>
    </Card>
  );
}
