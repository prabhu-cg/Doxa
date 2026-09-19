"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recordDecisionFieldSchema } from "@/features/decisions/schema";
import { recordDecision } from "@/features/decisions/actions";
import {
  DECISION_TYPES,
  DECISION_TYPE_LABELS,
  ROADMAP_STAGES,
  ROADMAP_STAGE_LABELS,
} from "@/features/decisions/schema";
import { DecisionBadge } from "@/components/decision-badge";
import { Drawer } from "@/components/drawer";
import { FormField } from "@/components/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DecisionEntry = {
  id: string;
  type: (typeof DECISION_TYPES)[number];
  rationale: string;
  targetDate: Date | null;
  internalNotes: string | null;
  roadmapStage: (typeof ROADMAP_STAGES)[number] | null;
  createdAt: Date;
  createdBy: { displayName: string };
};

type FormValues = {
  type: (typeof DECISION_TYPES)[number];
  rationale: string;
  targetDate?: string;
  internalNotes?: string;
  roadmapStage?: (typeof ROADMAP_STAGES)[number] | "";
};

export function DecisionPanel({
  orgSlug,
  boardSlug,
  itemSlug,
  canRecord,
  history,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  canRecord: boolean;
  history: DecisionEntry[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = history[0];

  return (
    <div className="space-y-3">
      {current ? (
        <div className="space-y-2">
          <DecisionBadge type={current.type} bare />
          <p className="text-sm whitespace-pre-wrap">{current.rationale}</p>
          <p className="text-muted-foreground text-xs">
            {current.createdBy.displayName} ·{" "}
            {current.createdAt.toLocaleDateString()}
            {current.targetDate
              ? ` · Target ${current.targetDate.toLocaleDateString()}`
              : null}
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No decision recorded yet.
        </p>
      )}

      {canRecord ? (
        <Button
          size="sm"
          variant={current ? "outline" : "default"}
          className="w-full"
          onClick={() => setOpen(true)}
        >
          {current ? "Update decision" : "Record decision"}
        </Button>
      ) : null}

      {history.length > 1 ? (
        <details className="text-sm">
          <summary className="text-muted-foreground cursor-pointer text-xs font-medium">
            Decision history ({history.length})
          </summary>
          <ul className="mt-3 space-y-3">
            {history.map((decision) => (
              <li key={decision.id} className="border-l pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <DecisionBadge type={decision.type} bare />
                  <span className="text-muted-foreground text-xs">
                    {decision.createdBy.displayName} ·{" "}
                    {decision.createdAt.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{decision.rationale}</p>
                {decision.internalNotes ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Internal notes: {decision.internalNotes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Record decision"
        description="Tell people what the team decided, and why."
      >
        <RecordDecisionForm
          orgSlug={orgSlug}
          boardSlug={boardSlug}
          itemSlug={itemSlug}
          onDone={() => {
            setOpen(false);
            router.refresh();
          }}
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </div>
  );
}

function RecordDecisionForm({
  orgSlug,
  boardSlug,
  itemSlug,
  onDone,
  onCancel,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(recordDecisionFieldSchema),
    defaultValues: { type: "PLANNED", rationale: "", roadmapStage: "" },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await recordDecision(orgSlug, boardSlug, itemSlug, {
      type: values.type,
      rationale: values.rationale,
      targetDate: values.targetDate,
      internalNotes: values.internalNotes,
      roadmapStage: values.roadmapStage ? values.roadmapStage : undefined,
    });
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Type" htmlFor="type" error={errors.type?.message}>
        <select
          id="type"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-10 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3"
          {...register("type")}
        >
          {DECISION_TYPES.map((type) => (
            <option key={type} value={type}>
              {DECISION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Rationale"
        htmlFor="rationale"
        error={errors.rationale?.message}
      >
        <Textarea
          id="rationale"
          rows={4}
          placeholder="Declined because the requested behaviour conflicts with the current architecture and demand does not justify the implementation cost."
          aria-invalid={!!errors.rationale}
          {...register("rationale")}
        />
      </FormField>

      <FormField
        label="Target date (optional)"
        htmlFor="targetDate"
        error={errors.targetDate?.message}
      >
        <Input id="targetDate" type="date" {...register("targetDate")} />
      </FormField>

      <FormField
        label="Roadmap (optional)"
        htmlFor="roadmapStage"
        error={errors.roadmapStage?.message}
      >
        <select
          id="roadmapStage"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-10 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3"
          {...register("roadmapStage")}
        >
          <option value="">Not on roadmap</option>
          {ROADMAP_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {ROADMAP_STAGE_LABELS[stage]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Internal notes (optional, never shown publicly)"
        htmlFor="internalNotes"
        error={errors.internalNotes?.message}
      >
        <Textarea id="internalNotes" rows={3} {...register("internalNotes")} />
      </FormField>

      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Recording…" : "Record decision"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
