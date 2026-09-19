import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DecisionBadge } from "@/components/decision-badge";
import { PublicDecisionHistory } from "@/components/public-decision-history";
import { CommentSection } from "@/components/participation/comment-section";
import { FollowButton } from "@/components/participation/follow-button";
import { ParticipationNotice } from "@/components/participation/participation-notice";
import { VoteButton } from "@/components/participation/vote-button";
import { toCommentData } from "@/features/comments/mapper";
import { listCommentsForItem } from "@/features/comments/queries";
import { listPublicDecisionsForItem } from "@/features/decisions/transparency";
import {
  getFollowerCountForItem,
  isFollowingItem,
} from "@/features/followers/queries";
import { loadPublicItem } from "@/features/items/public";
import { listTeamMemberIds } from "@/features/moderation/queries";
import { hasAtLeastRole } from "@/features/organizations/permissions";
import { hasUserVotedForItem } from "@/features/votes/queries";
import { formatRelativeTime } from "@/lib/utils";
import { badgeColors } from "@/lib/brand-color";
import { authPath } from "@/lib/safe-next";
import { LinkButton } from "@/components/link-button";
import { ChevronUp } from "lucide-react";
import { DECISION_TYPE_LABELS } from "@/features/decisions/schema";
import { publicItemPath } from "@/lib/public-links";

function tint(color?: string | null) {
  const badge = badgeColors(color);
  return badge
    ? { backgroundColor: badge.background, color: badge.color }
    : undefined;
}

/** The drawer header's second and third lines: where the item stands (status,
 * the team's decision, type) beside the board it is on, then who raised it and
 * when. Kept in the fixed header, so it stays in view while the body scrolls. */
export async function ItemDrawerSubheader({
  orgSlug,
  boardSlug,
  itemSlug,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
}) {
  const { item, board, organization } = await loadPublicItem(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  const [decisions, teamIds] = await Promise.all([
    listPublicDecisionsForItem(item.id),
    listTeamMemberIds(organization.id),
  ]);
  const currentDecision = decisions[0];
  const repeatsStatus =
    !!currentDecision &&
    DECISION_TYPE_LABELS[currentDecision.type].toLowerCase() ===
      item.status.name.toLowerCase();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {repeatsStatus ? (
          <Badge variant="outline">{item.status.name}</Badge>
        ) : (
          <Badge variant="soft" style={tint(item.status.color)}>
            {item.status.name}
          </Badge>
        )}
        {currentDecision ? (
          <DecisionBadge type={currentDecision.type} bare />
        ) : null}
        <Badge variant="outline">{item.itemType.name}</Badge>
        {item.category ? (
          <Badge variant="outline">{item.category.name}</Badge>
        ) : null}
        <span className="text-muted-foreground text-sm">{board.name}</span>
      </div>
      <p className="text-muted-foreground text-[13px]">
        {item.author.displayName}
        {teamIds.has(item.authorId) ? " (team)" : ""} ·{" "}
        {formatRelativeTime(item.createdAt)}
      </p>
    </div>
  );
}

/** "Open page": the item at its own address, at the drawer header's top right. */
export function OpenPageLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex items-center gap-1 rounded-sm text-sm font-semibold whitespace-nowrap underline-offset-4 outline-none hover:underline focus-visible:ring-2"
    >
      Open page
      <ArrowUpRight aria-hidden="true" className="size-3.5" />
    </Link>
  );
}

/**
 * An item as the public sees it: what it is, the team's decision and reasons,
 * the description, and the discussion — with the vote and follow controls for
 * whoever may use them. `drawer` is one column for the side panel; `page` is the
 * standalone address, with the decision and controls in a rail beside the text.
 */
export async function PublicItemDetail({
  orgSlug,
  boardSlug,
  itemSlug,
  variant,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  variant: "page" | "drawer";
}) {
  const { organization, item, viewer } = await loadPublicItem(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  const here = publicItemPath(orgSlug, boardSlug, itemSlug);

  const profileId = viewer.status === "anonymous" ? null : viewer.profile.id;
  const canParticipate = viewer.status === "active" && !item.awaitingReview;
  const role = viewer.status === "active" ? viewer.role : null;

  const [followerCount, decisions, comments, teamIds, hasVoted, following] =
    await Promise.all([
      getFollowerCountForItem(item.id),
      listPublicDecisionsForItem(item.id),
      listCommentsForItem(item.id),
      listTeamMemberIds(organization.id),
      profileId ? hasUserVotedForItem(item.id, profileId) : false,
      profileId ? isFollowingItem(item.id, profileId) : false,
    ]);
  const currentDecision = decisions[0];

  const facts = (
    <div className="flex flex-wrap items-center gap-1.5">
      {currentDecision &&
      DECISION_TYPE_LABELS[currentDecision.type].toLowerCase() ===
        item.status.name.toLowerCase() ? (
        <Badge variant="outline">{item.status.name}</Badge>
      ) : (
        <Badge variant="soft" style={tint(item.status.color)}>
          {item.status.name}
        </Badge>
      )}
      {currentDecision ? (
        <DecisionBadge type={currentDecision.type} bare />
      ) : null}
      <Badge variant="outline">{item.itemType.name}</Badge>
      {item.category ? (
        <Badge variant="outline">{item.category.name}</Badge>
      ) : null}
    </div>
  );

  const byline = (
    <p className="text-muted-foreground text-[13px]">
      {item.author.displayName}
      {teamIds.has(item.authorId) ? " (team)" : ""} ·{" "}
      {formatRelativeTime(item.createdAt)}
    </p>
  );

  const pending = item.awaitingReview ? (
    <div
      role="status"
      className="bg-accent/60 rounded-lg border px-4 py-3 text-sm"
    >
      <p className="font-semibold">Waiting for review</p>
      <p className="text-muted-foreground text-xs">
        The team will look at your submission soon. Until they approve it, only
        you can see it.
      </p>
    </div>
  ) : null;

  const signal = item.awaitingReview ? null : (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {canParticipate ? (
          <>
            <VoteButton
              // Own optimistic state: remount when the server's numbers change
              // (a vote made from the grid behind the drawer).
              key={`vote-${hasVoted}-${item._count.votes}`}
              orgSlug={orgSlug}
              boardSlug={boardSlug}
              itemSlug={itemSlug}
              initialVoted={hasVoted}
              initialCount={item._count.votes}
            />
            <FollowButton
              key={`follow-${following}-${followerCount}`}
              orgSlug={orgSlug}
              boardSlug={boardSlug}
              itemSlug={itemSlug}
              initialFollowing={following}
              initialCount={followerCount}
            />
          </>
        ) : viewer.status === "anonymous" ? (
          // The main action, where the visitor is reading the decision — not a
          // sentence about it.
          <LinkButton
            href={authPath("login", here)}
            variant="outline"
            size="sm"
          >
            <ChevronUp strokeWidth={2.5} />
            Sign in to vote · {item._count.votes}
          </LinkButton>
        ) : (
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-semibold tabular-nums">
              {item._count.votes}
            </span>{" "}
            {item._count.votes === 1 ? "vote" : "votes"}
          </p>
        )}
      </div>
      {canParticipate || viewer.status === "anonymous" ? null : (
        <p className="text-muted-foreground text-sm">
          <ParticipationNotice viewer={viewer} next={here} action="vote" />
        </p>
      )}
    </div>
  );

  const decision = <PublicDecisionHistory decisions={decisions} />;

  const body = (
    <>
      <h2 className="text-sm font-semibold">Description</h2>
      {item.description ? (
        <p className="max-w-prose text-[15px] leading-7 whitespace-pre-wrap">
          {item.description}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">No description.</p>
      )}
      {item.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </>
  );

  const discussion = item.awaitingReview ? null : (
    <section aria-label="Discussion" className="space-y-4">
      <h2 className="text-base font-bold tracking-tight">
        Discussion{" "}
        <span className="text-muted-foreground font-medium tabular-nums">
          {item._count.comments}
        </span>
      </h2>
      <CommentSection
        orgSlug={orgSlug}
        boardSlug={boardSlug}
        itemSlug={itemSlug}
        comments={comments.map((c) => toCommentData(c, teamIds))}
        currentUserId={profileId}
        canComment={canParticipate}
        canModerate={role !== null && hasAtLeastRole(role, "ADMIN")}
        allowMentions={role !== null}
        cannotCommentNotice={
          <ParticipationNotice viewer={viewer} next={here} action="comment" />
        }
      />
    </section>
  );

  if (variant === "drawer") {
    // Title, status, board and byline are in the drawer's own header. Below it:
    // what was asked, the team's answer, then the vote — and the conversation.
    return (
      <div className="space-y-6">
        {pending}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Details</h2>
          {item.description ? (
            <p className="text-base leading-7 whitespace-pre-wrap">
              {item.description}
            </p>
          ) : (
            <p className="text-muted-foreground">No description.</p>
          )}
          {item.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tags.map(({ tag }) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        {decisions.length > 0 ? (
          <div className="bg-surface rounded-xl border p-4">{decision}</div>
        ) : null}
        {signal}
        {discussion ? <div className="border-t pt-6">{discussion}</div> : null}
      </div>
    );
  }

  return (
    <div className="grid items-start gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-[28px] leading-tight font-bold tracking-tight text-balance">
            {item.title}
          </h1>
          {facts}
          {byline}
        </div>
        {pending}
        <div className="space-y-4">{body}</div>
        {discussion ? <div className="border-t pt-8">{discussion}</div> : null}
      </div>
      <aside
        aria-label="Vote and decision"
        className="bg-surface space-y-6 rounded-xl border p-5 lg:sticky lg:top-[calc(var(--public-topbar)+1.5rem)]"
      >
        {signal}
        {decisions.length > 0 ? (
          <div className="border-t pt-5">{decision}</div>
        ) : null}
      </aside>
    </div>
  );
}
