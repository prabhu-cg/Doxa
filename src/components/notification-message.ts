import { DECISION_TYPE_LABELS } from "@/features/decisions/schema";

export type NotificationKind =
  | "ITEM_COMMENT"
  | "COMMENT_REPLY"
  | "ITEM_STATUS_CHANGED"
  | "ITEM_DECISION"
  | "ITEM_SUBMITTED"
  | "MENTION";

/** The one-line text the bell shows for a notification. */
export function notificationMessage(n: {
  type: NotificationKind;
  actorName: string | null;
  itemTitle: string | null;
  data: Record<string, unknown>;
}): string {
  const actor = n.actorName ?? "Someone";
  const title = n.itemTitle ?? "an item";
  switch (n.type) {
    case "ITEM_COMMENT":
      return `${actor} commented on "${title}"`;
    case "COMMENT_REPLY":
      return `${actor} replied to your comment on "${title}"`;
    case "ITEM_STATUS_CHANGED":
      return `"${title}" changed from ${n.data.fromStatus} to ${n.data.toStatus}`;
    case "ITEM_DECISION": {
      const type = n.data.decisionType as keyof typeof DECISION_TYPE_LABELS;
      return `Decision on "${title}": ${DECISION_TYPE_LABELS[type] ?? "recorded"}`;
    }
    case "ITEM_SUBMITTED":
      return n.data.awaitingReview
        ? `${actor} submitted "${title}" — waiting for your review`
        : `${actor} submitted "${title}"`;
    case "MENTION":
      return `${actor} mentioned you on "${title}"`;
  }
}
