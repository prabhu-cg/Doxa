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
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { formatRelativeTime } from "@/lib/utils";
import { boardTrail } from "@/lib/breadcrumb-trails";
import { publicItemPath } from "@/lib/public-links";
import { CopyLinkButton } from "@/components/public-link";
import { EditItemDrawer } from "./edit-item-drawer";
import { VoteButton } from "./vote-button";
import { FollowButton } from "./follow-button";
import { CommentSection } from "./comment-section";
import { toCommentData } from "@/features/comments/mapper";
import { ActivityFeed } from "./activity-feed";
import { ScorePanel } from "./score-panel";
import { DecisionPanel } from "./decision-panel";

function tint(color?: string | null) {
  return color ? { backgroundColor: `${color}22`, color } : undefined;
}

/** One block of the assessment rail. */
function RailSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default async function ItemAdminPage({
  params,
}: {
  params: Promise<{ slug: string; boardSlug: string; itemSlug: string }>;
}) {
  const { slug, boardSlug, itemSlug } = await params;
  const { profile, membership, board, item } = await requireItemForOrgMember(
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

  const priorityIsSet = item.priority.slug !== "none";
  // The public page exists only for a Public, active board and a live item.
  const publicPath =
    board.visibility === "PUBLIC" &&
    board.status === "ACTIVE" &&
    !item.archivedAt
      ? publicItemPath(slug, boardSlug, itemSlug)
      : null;

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[...boardTrail(slug, board), { label: item.title }]}
        title={item.title}
        badges={
          <>
            <Badge variant="soft" style={tint(item.status.color)}>
              {item.status.name}
            </Badge>
            {item.archivedAt ? (
              <Badge variant="secondary">Archived</Badge>
            ) : null}
          </>
        }
        description={`Submitted by ${item.author.displayName} · ${formatRelativeTime(item.createdAt)}`}
        actions={
          publicPath || canEdit ? (
            <>
              {publicPath ? <CopyLinkButton path={publicPath} /> : null}
              {canEdit ? (
                <EditItemDrawer
                  orgSlug={slug}
                  boardSlug={boardSlug}
                  itemSlug={itemSlug}
                  title={item.title}
                  archived={!!item.archivedAt}
                  canArchive={canArchive}
                  initial={{
                    title: item.title,
                    description: item.description ?? "",
                    itemTypeId: item.itemTypeId,
                    statusId: item.statusId,
                    priorityId: item.priorityId,
                    categoryId: item.categoryId ?? "",
                    tags: item.tags.map(({ tag }) => tag.name),
                  }}
                  itemTypes={itemTypes.map((t) => ({ id: t.id, name: t.name }))}
                  statuses={statuses.map((st) => ({
                    id: st.id,
                    name: st.name,
                  }))}
                  priorities={priorities.map((p) => ({
                    id: p.id,
                    name: p.name,
                  }))}
                  categories={categories.map((c) => ({
                    id: c.id,
                    name: c.name,
                  }))}
                />
              ) : null}
            </>
          ) : undefined
        }
      />

      {/* Reads top to bottom on a phone (what it is → where it stands →
          the conversation); on a wide screen the assessment rail sits beside
          the description and discussion. */}
      <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_1fr]">
        <section
          aria-label="Description"
          className="lg:col-start-1 lg:row-start-1"
        >
          {item.description ? (
            <p className="max-w-prose text-base leading-7 whitespace-pre-wrap">
              {item.description}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              No description provided.
            </p>
          )}
        </section>

        <aside
          aria-label="Assessment"
          className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <Card className="gap-0 divide-y py-0">
            <RailSection title="Decision">
              <DecisionPanel
                orgSlug={slug}
                boardSlug={boardSlug}
                itemSlug={itemSlug}
                canRecord={canRecord}
                history={decisions}
              />
            </RailSection>

            <RailSection title="Details">
              <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-2.5 text-sm">
                <dt className="text-muted-foreground">Type</dt>
                <dd>{item.itemType.name}</dd>

                <dt className="text-muted-foreground">Priority</dt>
                <dd>
                  {priorityIsSet ? (
                    <Badge variant="warning" style={tint(item.priority.color)}>
                      {item.priority.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </dd>

                {item.category ? (
                  <>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd>{item.category.name}</dd>
                  </>
                ) : null}

                {item.tags.length > 0 ? (
                  <>
                    <dt className="text-muted-foreground">Tags</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {item.tags.map(({ tag }) => (
                        <Badge key={tag.id} variant="outline">
                          {tag.name}
                        </Badge>
                      ))}
                    </dd>
                  </>
                ) : null}
              </dl>
            </RailSection>

            <RailSection
              title="Community signal"
              hint="Interest, not priority."
            >
              <div className="flex flex-wrap gap-2">
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
              </div>
            </RailSection>

            {canScore ? (
              <RailSection
                title="Business signal"
                hint="How the team rates it."
              >
                <ScorePanel
                  orgSlug={slug}
                  boardSlug={boardSlug}
                  itemSlug={itemSlug}
                  criteria={scoreCriteria.map((c) => ({
                    id: c.id,
                    name: c.name,
                    description: c.description,
                  }))}
                  scores={itemScores.map((sc) => ({
                    criterionId: sc.criterionId,
                    value: sc.value,
                  }))}
                  computed={computedScore}
                />
              </RailSection>
            ) : null}
          </Card>
        </aside>

        <section
          aria-label="Discussion and activity"
          className="border-t pt-8 lg:col-start-1 lg:row-start-2"
        >
          <Tabs defaultValue="discussion">
            <TabsList>
              <TabsTrigger value="discussion">
                Discussion ({commentCount})
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="discussion" className="pt-4">
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
            <TabsContent value="activity" className="pt-4">
              <ActivityFeed activities={activities} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </PageContainer>
  );
}
