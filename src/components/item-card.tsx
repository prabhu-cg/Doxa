import { MessageSquare, ThumbsUp, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DecisionBadge } from "@/components/decision-badge";
import type { DECISION_TYPES } from "@/features/decisions/schema";
import { EntityCard, EntityMeta } from "@/components/entity-card";
import { formatRelativeTime } from "@/lib/utils";

function tint(color?: string | null) {
  return color ? { backgroundColor: `${color}22`, color } : undefined;
}

export function ItemCard({
  href,
  title,
  description,
  itemTypeName,
  statusName,
  statusColor,
  priorityName,
  priorityColor,
  categoryName,
  decisionType,
  tagNames,
  authorName,
  voteCount,
  commentCount,
  updatedAt,
  archived,
}: {
  href: string;
  title: string;
  description?: string | null;
  itemTypeName: string;
  statusName: string;
  statusColor?: string | null;
  /** Omit (or pass null) for items with no priority set. */
  priorityName?: string | null;
  priorityColor?: string | null;
  categoryName?: string | null;
  /** The item's current decision, if the team has made one. */
  decisionType?: (typeof DECISION_TYPES)[number] | null;
  tagNames: string[];
  authorName: string;
  voteCount: number;
  commentCount: number;
  updatedAt: Date;
  archived?: boolean;
}) {
  return (
    <EntityCard
      href={href}
      title={title}
      badges={
        <>
          <Badge variant="soft" style={tint(statusColor)}>
            {statusName}
          </Badge>
          <Badge variant="outline">{itemTypeName}</Badge>
          {decisionType ? <DecisionBadge type={decisionType} /> : null}
          {archived ? <Badge variant="secondary">Archived</Badge> : null}
        </>
      }
      subtitle={categoryName}
      description={description}
      meta={
        <>
          <EntityMeta icon={ThumbsUp}>
            {voteCount} {voteCount === 1 ? "vote" : "votes"}
          </EntityMeta>
          <EntityMeta icon={MessageSquare}>
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </EntityMeta>
          {priorityName ? (
            <Badge variant="warning" style={tint(priorityColor)}>
              {priorityName}
            </Badge>
          ) : null}
          <EntityMeta icon={User}>{authorName}</EntityMeta>
        </>
      }
      tags={
        tagNames.length > 0
          ? tagNames.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))
          : undefined
      }
      footer={`Updated ${formatRelativeTime(updatedAt)}`}
    />
  );
}
