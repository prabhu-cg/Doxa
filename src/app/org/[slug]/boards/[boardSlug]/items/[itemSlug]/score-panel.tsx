"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearItemScore, setItemScore } from "@/features/scoring/actions";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

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
        <a className="underline" href={`/org/${orgSlug}/settings/scoring`}>
          organisation settings
        </a>
        .
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {computed ? (
        <p className="text-sm">
          Weighted score:{" "}
          <span className="font-semibold">
            {computed.weightedAverage.toFixed(1)} / 5
          </span>{" "}
          <span className="text-muted-foreground">
            across {computed.scoredCount} of {criteria.length} criteria
          </span>
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">Not scored yet.</p>
      )}

      <div className="space-y-2">
        {criteria.map((criterion) => (
          <Card key={criterion.id}>
            <CardContent className="flex items-center justify-between gap-4">
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
                value={
                  scores.find((s) => s.criterionId === criterion.id)?.value
                }
                onChanged={() => router.refresh()}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ScoreControl({
  orgSlug,
  boardSlug,
  itemSlug,
  criterionId,
  value,
  onChanged,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  criterionId: string;
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
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex gap-1">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            disabled={isPending}
            onClick={() => pick(n)}
            aria-pressed={value === n}
            aria-label={`Score ${n}`}
            className={cn(
              "flex size-7 items-center justify-center rounded-md border text-xs font-medium transition-colors",
              value === n
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-accent border-input",
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
