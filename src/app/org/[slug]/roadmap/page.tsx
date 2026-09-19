import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { listRoadmapForOrganization } from "@/features/roadmap/queries";
import {
  ROADMAP_STAGES,
  ROADMAP_STAGE_LABELS,
} from "@/features/decisions/schema";
import type { RoadmapItem } from "@/features/roadmap/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/page-shell";

export const metadata: Metadata = { title: "Roadmap" };

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const board = await listRoadmapForOrganization(membership.organization.id);

  return (
    <PageContainer>
      <PageHeader
        title="Roadmap"
        description="A basic Now / Next / Later view built from Items and the decisions recorded about them — an Item lands here only once an owner or admin explicitly places it, not because it got votes."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ROADMAP_STAGES.map((stage) => (
          <div key={stage} className="space-y-3">
            <h2 className="text-sm font-semibold">
              {ROADMAP_STAGE_LABELS[stage]}{" "}
              <span className="text-muted-foreground font-normal">
                ({board[stage].length})
              </span>
            </h2>
            {board[stage].length === 0 ? (
              <p className="text-muted-foreground text-xs">Nothing here yet.</p>
            ) : (
              <div className="space-y-3">
                {board[stage].map((item) => (
                  <RoadmapCard key={item.id} orgSlug={slug} item={item} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

function RoadmapCard({
  orgSlug,
  item,
}: {
  orgSlug: string;
  item: RoadmapItem;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          <Link
            href={`/org/${orgSlug}/boards/${item.board.slug}/items/${item.slug}`}
            className="hover:underline"
          >
            {item.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-xs">
            {item.itemType.name}
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs"
            style={
              item.status.color
                ? {
                    backgroundColor: `${item.status.color}22`,
                    color: item.status.color,
                  }
                : undefined
            }
          >
            {item.status.name}
          </Badge>
          {item.priority.slug !== "none" ? (
            <Badge
              variant="secondary"
              className="text-xs"
              style={
                item.priority.color
                  ? {
                      backgroundColor: `${item.priority.color}22`,
                      color: item.priority.color,
                    }
                  : undefined
              }
            >
              {item.priority.name}
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground line-clamp-2 text-xs">
          {item.currentDecision.rationale}
        </p>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>
            {item._count.votes} {item._count.votes === 1 ? "vote" : "votes"}
          </span>
          {item.currentDecision.targetDate ? (
            <span>
              · target {item.currentDecision.targetDate.toLocaleDateString()}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
