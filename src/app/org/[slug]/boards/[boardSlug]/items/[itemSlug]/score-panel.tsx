"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearItemScore, setItemScore } from "@/features/scoring/actions";
import { cn } from "@/lib/utils";

type Criterion = {
  id: string;
  name: string;
  description: string | null;
};

type Score = { criterionId: string; value: number };

const SCALE = [1, 2, 3, 4, 5] as const;

export function ScorePanel({
  orgSlug,
  boardSlug,
  itemSlug,
  criteria,
  scores,
  computed,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  criteria: Criterion[];
  scores: Score[];
  computed: { weightedAverage: number; scoredCount: number } | null;
}) {
  const router = useRouter();

  if (criteria.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No scoring criteria configured yet — an owner or admin can add some in{" "}
        <Link className="underline" href={`/org/${orgSlug}/settings/scoring`}>
          organisation settings
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {computed ? (
        <p className="text-sm">
          <span className="text-base font-semibold tabular-nums">
            {computed.weightedAverage.toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            {" "}
            / 5 · {computed.scoredCount} of {criteria.length} scored
          </span>
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">Not scored yet.</p>
      )}

      <ul className="space-y-4">
        {criteria.map((criterion) => (
          <li key={criterion.id} className="space-y-1.5">
            <div>
              <p className="text-sm font-medium">{criterion.name}</p>
              {criterion.description ? (
                <p className="text-muted-foreground text-xs">
                  {criterion.description}
                </p>
              ) : null}
            </div>
            <ScoreControl
              orgSlug={orgSlug}
              boardSlug={boardSlug}
              itemSlug={itemSlug}
              criterionId={criterion.id}
              criterionName={criterion.name}
              value={scores.find((s) => s.criterionId === criterion.id)?.value}
              onChanged={() => router.refresh()}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreControl({
  orgSlug,
  boardSlug,
  itemSlug,
  criterionId,
  criterionName,
  value,
  onChanged,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  criterionId: string;
  criterionName: string;
  value: number | undefined;
  onChanged: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick(n: number) {
    startTransition(async () => {
      setError(null);
      const result =
        value === n
          ? await clearItemScore(orgSlug, boardSlug, itemSlug, criterionId)
          : await setItemScore(orgSlug, boardSlug, itemSlug, criterionId, n);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  }

  return (
    <div className="space-y-1">
      <div
        role="group"
        aria-label={`${criterionName} score`}
        className="flex gap-1"
      >
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            disabled={isPending}
            onClick={() => pick(n)}
            aria-pressed={value === n}
            aria-label={`${criterionName}: ${n} out of 5`}
            className={cn(
              "focus-visible:ring-ring/50 flex h-8 flex-1 items-center justify-center rounded-md border text-xs font-medium tabular-nums transition-colors outline-none focus-visible:ring-3 disabled:opacity-60",
              value === n
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input hover:bg-primary-soft hover:text-primary-text",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
