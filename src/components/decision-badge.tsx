import { Badge } from "@/components/ui/badge";
import {
  DECISION_TYPE_COLORS,
  DECISION_TYPE_LABELS,
  type DECISION_TYPES,
} from "@/features/decisions/schema";

export function DecisionBadge({
  type,
}: {
  type: (typeof DECISION_TYPES)[number];
}) {
  const color = DECISION_TYPE_COLORS[type];
  return (
    <Badge variant="secondary" style={{ backgroundColor: `${color}22`, color }}>
      Decision: {DECISION_TYPE_LABELS[type]}
    </Badge>
  );
}
