import { requireItemForOrgMember } from "@/features/items/queries";
import { canArchiveItem, canEditItem } from "@/features/items/permissions";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { listStatusesForOrganization } from "@/features/statuses/queries";
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

  const [
    itemTypes,
    statuses,
    categories,
    voteCount,
    hasVoted,
    followerCount,
    following,
    comments,
    commentCount,
    activities,
  ] = await Promise.all([
    canEdit ? listItemTypesForOrganization(membership.organization.id) : [],
    canEdit ? listStatusesForOrganization(membership.organization.id) : [],
    canEdit ? listCategoriesForOrganization(membership.organization.id) : [],
    getVoteCountForItem(item.id),
    hasUserVotedForItem(item.id, profile.id),
    getFollowerCountForItem(item.id),
    isFollowingItem(item.id, profile.id),
    listCommentsForItem(item.id),
    countCommentsForItem(item.id),
    listActivityForItem(item.id),
  ]);

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
          {item.archivedAt ? <Badge variant="secondary">Archived</Badge> : null}
        </div>
        <p className="text-muted-foreground text-sm">
          Submitted by {item.author.displayName}
        </p>
      </div>

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
              initialCategoryId={item.categoryId ?? ""}
              initialTags={item.tags.map(({ tag }) => tag.name).join(", ")}
              itemTypes={itemTypes.map((t) => ({ id: t.id, name: t.name }))}
              statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
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
