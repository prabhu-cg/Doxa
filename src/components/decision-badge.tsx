import { Badge } from "@/components/ui/badge";
import { badgeColors } from "@/lib/brand-color";
import {
  DECISION_TYPE_COLORS,
  DECISION_TYPE_LABELS,
  type DECISION_TYPES,
} from "@/features/decisions/schema";

export function DecisionBadge({
  type,
  bare = false,
}: {
  type: (typeof DECISION_TYPES)[number];
  /** Just the label ("Planned"), for places a heading already says "Decision". */
  bare?: boolean;
}) {
  const color = DECISION_TYPE_COLORS[type];
  return (
    <Badge variant="secondary" style={badgeColors(color)}>
      {" "}
      {bare ? null : "Decision: "}
      {DECISION_TYPE_LABELS[type]}
    </Badge>
  );
}
