import { requireItemForOrgMember } from "@/features/items/queries";
import { canArchiveItem, canEditItem } from "@/features/items/permissions";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { listStatusesForOrganization } from "@/features/statuses/queries";
import { listPrioritiesForOrganization } from "@/features/priorities/queries";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import {
  getVoteCountForItem,
  hasUserVotedForItem,
} from "@/features/votes/queries";
import {
  getFollowerCountForItem,
  isFollowingItem,
} from "@/features/followers/queries";
import {
  listCommentsForItem,
  countCommentsForItem,
} from "@/features/comments/queries";
import { canCommentOnItem } from "@/features/comments/permissions";
import { listActivityForItem } from "@/features/activity/queries";
import { hasAtLeastRole } from "@/features/organizations/permissions";
import {
  computeItemScore,
  getScoresForItem,
  listScoreCriteriaForOrganization,
} from "@/features/scoring/queries";
import { canScoreItem } from "@/features/scoring/permissions";
import { listDecisionsForItem } from "@/features/decisions/queries";
import { canRecordDecision } from "@/features/decisions/permissions";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdateItemForm } from "./update-item-form";
import { ArchiveItemControl } from "./archive-item-control";
import { VoteButton } from "./vote-button";
import { FollowButton } from "./follow-button";
import { CommentSection } from "./comment-section";
import { toCommentData } from "@/features/comments/mapper";
import { ActivityFeed } from "./activity-feed";
import { ScorePanel } from "./score-panel";
import { DecisionPanel } from "./decision-panel";
import { DecisionBadge } from "@/components/decision-badge";

export default async function ItemAdminPage({
  params,
}: {
  params: Promise<{ slug: string; boardSlug: string; itemSlug: string }>;
}) {
  const { slug, boardSlug, itemSlug } = await params;
  const { profile, membership, item } = await requireItemForOrgMember(
    slug,
    boardSlug,
    itemSlug,
  );

  const isAuthor = item.authorId === profile.id;
  const canEdit = canEditItem(membership.role, isAuthor);
  const canArchive = canArchiveItem(membership.role, isAuthor);
  const canComment = canCommentOnItem(membership.role);
  const canModerate = hasAtLeastRole(membership.role, "ADMIN");
  const canScore = canScoreItem(membership.role);
  const canRecord = canRecordDecision(membership.role);

  const [
    itemTypes,
    statuses,
    priorities,
    categories,
    voteCount,
    hasVoted,
    followerCount,
    following,
    comments,
    commentCount,
    activities,
    scoreCriteria,
    itemScores,
    decisions,
  ] = await Promise.all([
    canEdit ? listItemTypesForOrganization(membership.organization.id) : [],
    canEdit ? listStatusesForOrganization(membership.organization.id) : [],
    canEdit ? listPrioritiesForOrganization(membership.organization.id) : [],
    canEdit ? listCategoriesForOrganization(membership.organization.id) : [],
    getVoteCountForItem(item.id),
    hasUserVotedForItem(item.id, profile.id),
    getFollowerCountForItem(item.id),
    isFollowingItem(item.id, profile.id),
    listCommentsForItem(item.id),
    countCommentsForItem(item.id),
    listActivityForItem(item.id),
    canScore
      ? listScoreCriteriaForOrganization(membership.organization.id)
      : [],
    canScore ? getScoresForItem(item.id) : [],
    listDecisionsForItem(item.id),
  ]);
  const computedScore = computeItemScore(itemScores);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      <div>
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
          {item.archivedAt ? <Badge variant="secondary">Archived</Badge> : null}
        </div>
        <p className="text-muted-foreground text-sm">
          Submitted by {item.author.displayName}
        </p>
      </div>

      {decisions[0] ? (
        <div>
          <DecisionBadge type={decisions[0].type} />
        </div>
      ) : null}

      <div className="space-y-2">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Community signal
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <VoteButton
            orgSlug={slug}
            boardSlug={boardSlug}
            itemSlug={itemSlug}
            initialVoted={hasVoted}
            initialCount={voteCount}
          />
          <FollowButton
            orgSlug={slug}
            boardSlug={boardSlug}
            itemSlug={itemSlug}
            initialFollowing={following}
            initialCount={followerCount}
          />
          <span className="text-muted-foreground text-xs">
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          Votes, comments, and followers show interest, not priority — see
          Business signal below for how this item is actually being evaluated.
        </p>
      </div>

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

      <Separator />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Decision</h2>
        <DecisionPanel
          orgSlug={slug}
          boardSlug={boardSlug}
          itemSlug={itemSlug}
          canRecord={canRecord}
          history={decisions}
        />
      </section>

      {canScore ? (
        <>
          <Separator />
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Business signal</h2>
              <p className="text-muted-foreground text-xs">
                Impact, value, effort, and strategic alignment — how this
                organisation is actually evaluating the item.
              </p>
            </div>
            <ScorePanel
              orgSlug={slug}
              boardSlug={boardSlug}
              itemSlug={itemSlug}
              criteria={scoreCriteria.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
              }))}
              scores={itemScores.map((s) => ({
                criterionId: s.criterionId,
                value: s.value,
              }))}
              computed={computedScore}
            />
          </section>
        </>
      ) : null}

      <Separator />

      <Tabs defaultValue="discussion">
        <TabsList>
          <TabsTrigger value="discussion">
            Discussion ({commentCount})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="discussion">
          <CommentSection
            orgSlug={slug}
            boardSlug={boardSlug}
            itemSlug={itemSlug}
            comments={comments.map(toCommentData)}
            currentUserId={profile.id}
            canComment={canComment}
            canModerate={canModerate}
          />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityFeed activities={activities} />
        </TabsContent>
      </Tabs>

      {canEdit ? (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-sm font-semibold">Edit item</h2>
            <UpdateItemForm
              orgSlug={slug}
              boardSlug={boardSlug}
              itemSlug={itemSlug}
              initialTitle={item.title}
              initialDescription={item.description ?? ""}
              initialItemTypeId={item.itemTypeId}
              initialStatusId={item.statusId}
              initialPriorityId={item.priorityId}
              initialCategoryId={item.categoryId ?? ""}
              initialTags={item.tags.map(({ tag }) => tag.name).join(", ")}
              itemTypes={itemTypes.map((t) => ({ id: t.id, name: t.name }))}
              statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
              priorities={priorities.map((p) => ({ id: p.id, name: p.name }))}
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            />
          </section>
        </>
      ) : null}

      {canArchive ? (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">
              {item.archivedAt ? "Restore item" : "Archive item"}
            </h2>
            <ArchiveItemControl
              orgSlug={slug}
              boardSlug={boardSlug}
              itemSlug={itemSlug}
              archived={!!item.archivedAt}
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
