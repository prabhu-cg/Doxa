import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ActivityWithActor } from "@/features/activity/queries";
import type { ActivityType } from "@/generated/prisma/client";
import { DECISION_TYPE_LABELS } from "@/features/decisions/schema";

const ACTIVITY_LABELS: Record<
  ActivityType,
  (data: Record<string, unknown>, actorName: string) => string
> = {
  ITEM_CREATED: (_data, actor) => `${actor} created this item`,
  ITEM_EDITED: (data, actor) =>
    data.approved
      ? `${actor} approved this submission`
      : `${actor} edited this item`,
  STATUS_CHANGED: (data, actor) =>
    `${actor} changed status from ${data.fromStatus} to ${data.toStatus}`,
  PRIORITY_CHANGED: (data, actor) =>
    `${actor} changed priority from ${data.fromPriority} to ${data.toPriority}`,
  VOTE_ADDED: (_data, actor) => `${actor} voted`,
  VOTE_REMOVED: (_data, actor) => `${actor} removed their vote`,
  COMMENT_ADDED: (_data, actor) => `${actor} commented`,
  ITEM_ARCHIVED: (_data, actor) => `${actor} archived this item`,
  ITEM_RESTORED: (_data, actor) => `${actor} restored this item`,
  DECISION_RECORDED: (data, actor) =>
    `${actor} recorded a decision: ${DECISION_TYPE_LABELS[data.decisionType as keyof typeof DECISION_TYPE_LABELS] ?? data.decisionType}`,
};

export function ActivityFeed({
  activities,
}: {
  activities: ActivityWithActor[];
}) {
  if (activities.length === 0) {
    return <p className="text-muted-foreground text-sm">No activity yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {activities.map((activity) => {
        const actorName = activity.actor?.displayName ?? "Someone";
        const data = (activity.data ?? {}) as Record<string, unknown>;
        const label = ACTIVITY_LABELS[activity.type](data, actorName);

        return (
          <li key={activity.id} className="flex items-center gap-2.5 text-sm">
            <Avatar className="size-6 shrink-0">
              <AvatarFallback className="text-[10px]">
                {actorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground flex-1">{label}</span>
            <span className="text-muted-foreground shrink-0 text-xs">
              {new Date(activity.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
