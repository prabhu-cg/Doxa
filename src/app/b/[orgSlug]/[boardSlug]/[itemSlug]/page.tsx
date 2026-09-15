import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVisibleItem } from "@/features/items/queries";
import { getFollowerCountForItem } from "@/features/followers/queries";
import { getCurrentDecisionForItem } from "@/features/decisions/queries";
import { Badge } from "@/components/ui/badge";
import { DecisionBadge } from "@/components/decision-badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string; itemSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug, boardSlug, itemSlug } = await params;
  const visible = await getVisibleItem(orgSlug, boardSlug, itemSlug);
  if (!visible) return {};
  return {
    title: `${visible.item.title} · ${visible.board.name}`,
    description: visible.item.description ?? undefined,
  };
}

export default async function PublicItemPage({
  params,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string; itemSlug: string }>;
}) {
  const { orgSlug, boardSlug, itemSlug } = await params;
  const visible = await getVisibleItem(orgSlug, boardSlug, itemSlug);
  if (!visible) notFound();
  const { organization, board, item } = visible;
  const [followerCount, currentDecision] = await Promise.all([
    getFollowerCountForItem(item.id),
    getCurrentDecisionForItem(item.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <Link
          href={`/b/${orgSlug}/${boardSlug}`}
          className="text-muted-foreground text-sm font-semibold tracking-tight"
        >
          ← {board.name}
        </Link>
        <p className="text-muted-foreground text-xs">{organization.name}</p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
          <Badge variant="outline">{item.itemType.name}</Badge>
          <Badge
            variant="secondary"
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
          {item.category ? (
            <Badge variant="outline">{item.category.name}</Badge>
          ) : null}
          {item.priority.slug !== "none" ? (
            <Badge
              variant="secondary"
              style={
                item.priority.color
                  ? {
                      backgroundColor: `${item.priority.color}22`,
                      color: item.priority.color,
                    }
                  : undefined
              }
            >
              {item.priority.name} priority
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm">
          Submitted by {item.author.displayName}
        </p>
        <p className="text-muted-foreground text-xs">
          {item._count.votes} {item._count.votes === 1 ? "vote" : "votes"} ·{" "}
          {item._count.comments}{" "}
          {item._count.comments === 1 ? "comment" : "comments"} ·{" "}
          {followerCount} {followerCount === 1 ? "follower" : "followers"} —
          sign in as an organisation member to vote, comment, and follow.
        </p>
      </div>

      {currentDecision ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <DecisionBadge type={currentDecision.type} />
            <span className="text-muted-foreground text-xs">
              {currentDecision.createdAt.toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">
            {currentDecision.rationale}
          </p>
        </div>
      ) : null}

      {item.description ? (
        <p className="text-sm whitespace-pre-wrap">{item.description}</p>
      ) : null}

      {item.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
