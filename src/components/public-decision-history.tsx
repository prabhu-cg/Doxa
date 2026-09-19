import { DecisionBadge } from "@/components/decision-badge";
import { formatDate } from "@/lib/format-date";
import { ROADMAP_STAGE_LABELS } from "@/features/decisions/schema";
import type { PublicDecision } from "@/features/decisions/transparency";

/**
 * The team's answer on a public item page: the current decision with its
 * reasons, then every earlier one, newest first, so people can see how the
 * call changed and why — not just where it ended up. `decisions` is newest
 * first; render nothing when there are none.
 */
export function PublicDecisionHistory({
  decisions,
}: {
  decisions: PublicDecision[];
}) {
  const [current, ...earlier] = decisions;
  if (!current) return null;

  return (
    <section aria-labelledby="team-decision" className="space-y-4">
      <div className="space-y-2">
        <h2 id="team-decision" className="text-sm font-semibold">
          The team&apos;s decision
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <DecisionBadge type={current.type} bare />
          <span className="text-muted-foreground text-xs">
            {formatDate(current.createdAt)}
          </span>
          {current.roadmapStage ? (
            <span className="text-muted-foreground text-xs">
              · On the roadmap: {ROADMAP_STAGE_LABELS[current.roadmapStage]}
            </span>
          ) : null}
          {current.targetDate ? (
            <span className="text-muted-foreground text-xs">
              · Target {formatDate(current.targetDate)}
            </span>
          ) : null}
        </div>
        <p className="text-sm whitespace-pre-wrap">{current.rationale}</p>
      </div>

      {earlier.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-xs font-semibold">
            Earlier decisions
          </h3>
          <ol className="space-y-3">
            {earlier.map((decision) => (
              <li key={decision.id} className="border-l pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <DecisionBadge type={decision.type} bare />
                  <span className="text-muted-foreground text-xs">
                    {formatDate(decision.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap">
                  {decision.rationale}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
