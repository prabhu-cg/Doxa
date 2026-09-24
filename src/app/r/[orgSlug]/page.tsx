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
        className="public-masthead border-b"
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
          <div className="rounded-xl border border-dashed px-6 py-16 text-center">
            <p className="font-semibold">Nothing on the roadmap yet</p>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
              When {organization.name} decides to plan, start or ship something,
              it appears here with the reason why.
            </p>
            {boards[0] ? (
              <Link
                href={publicBoardPath(orgSlug, boards[0].slug)}
                className="text-primary-text mt-4 inline-block text-sm font-semibold underline-offset-4 hover:underline"
              >
                See what people are asking for
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
              {ROADMAP_STAGES.map((stage) => (
                <section
                  key={stage}
                  aria-labelledby={`stage-${stage}`}
                  className="min-w-0"
                >
                  <h2
                    id={`stage-${stage}`}
                    className="border-foreground flex items-baseline justify-between border-b-2 pb-2 text-sm font-semibold"
                  >
                    {ROADMAP_STAGE_LABELS[stage]}
                    <span className="text-muted-foreground font-medium tabular-nums">
                      {stages[stage].length}
                    </span>
                  </h2>
                  {stages[stage].length === 0 ? (
                    <p className="text-muted-foreground py-4 text-sm">
                      Nothing decided for this stage yet.
                    </p>
                  ) : (
                    <ul className="divide-y">
                      {stages[stage].map((item) => (
                        <RoadmapEntry
                          key={item.id}
                          orgSlug={orgSlug}
                          item={item}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {shipped.length > 0 ? (
              <section className="space-y-3">
                <h2 className="border-foreground border-b-2 pb-2 text-sm font-semibold">
                  Recently shipped
                </h2>
                <ul className="divide-y border-b">
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
                        className="hover:text-primary-text text-sm font-semibold underline-offset-4 hover:underline"
                      >
                        {item.title}
                      </Link>
                      <span className="text-muted-foreground text-xs tabular-nums">
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

/** One decided item under its stage: the title, the team's reason, and the
 * numbers — a ruled list rather than cards, so the reasons read as prose. */
function RoadmapEntry({
  orgSlug,
  item,
}: {
  orgSlug: string;
  item: PublicRoadmapItem;
}) {
  return (
    <li className="space-y-1.5 py-4">
      <Link
        href={publicItemPath(orgSlug, item.boardSlug, item.slug)}
        className="hover:text-primary-text block text-[15px] leading-snug font-semibold underline-offset-4 hover:underline"
      >
        {item.title}
      </Link>
      {item.rationale ? (
        <p className="text-muted-foreground line-clamp-3 text-[13px] leading-5">
          {item.rationale}
        </p>
      ) : null}
      <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums">
        <Badge variant="outline">{item.itemTypeName}</Badge>
        <span>
          {item.votes} {item.votes === 1 ? "vote" : "votes"}
        </span>
        {item.targetDate ? (
          <span>· target {formatDate(item.targetDate)}</span>
        ) : null}
      </p>
    </li>
  );
}
