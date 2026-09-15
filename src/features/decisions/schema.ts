import { z } from "zod";
import { optionalText } from "@/lib/schema-helpers";

export const DECISION_TYPES = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "DECLINED",
  "DEFERRED",
  "DUPLICATE",
] as const;

export const DECISION_TYPE_LABELS: Record<
  (typeof DECISION_TYPES)[number],
  string
> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  DEFERRED: "Deferred",
  DUPLICATE: "Duplicate",
};

export const DECISION_TYPE_COLORS: Record<
  (typeof DECISION_TYPES)[number],
  string
> = {
  PLANNED: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  COMPLETED: "#22c55e",
  DECLINED: "#ef4444",
  DEFERRED: "#94a3b8",
  DUPLICATE: "#a855f7",
};

export const ROADMAP_STAGES = ["NOW", "NEXT", "LATER"] as const;

export const ROADMAP_STAGE_LABELS: Record<
  (typeof ROADMAP_STAGES)[number],
  string
> = {
  NOW: "Now",
  NEXT: "Next",
  LATER: "Later",
};

const optionalDateInput = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? new Date(value) : undefined))
  .refine((value) => value === undefined || !Number.isNaN(value.getTime()), {
    message: "Enter a valid date",
  });

const optionalRoadmapStage = z
  .enum(ROADMAP_STAGES)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const decisionRationaleSchema = z
  .string()
  .trim()
  .min(10, "Explain the reasoning in at least 10 characters")
  .max(2000, "Rationale must be at most 2000 characters");

export const recordDecisionSchema = z.object({
  type: z.enum(DECISION_TYPES),
  rationale: decisionRationaleSchema,
  targetDate: optionalDateInput,
  internalNotes: optionalText(2000, "Internal notes"),
  roadmapStage: optionalRoadmapStage,
});

/** Same fields as recordDecisionSchema, without the empty-string ->
 * undefined/Date transforms — for the client-side form, where a plain
 * (non-transforming) schema keeps react-hook-form's input/output types
 * identical. See itemDescriptionFieldSchema (features/items/schema.ts)
 * for the same pattern. The Server Action's schema still normalizes on
 * submit. */
export const recordDecisionFieldSchema = z.object({
  type: z.enum(DECISION_TYPES),
  rationale: decisionRationaleSchema,
  targetDate: z.string().optional(),
  internalNotes: z
    .string()
    .trim()
    .max(2000, "Internal notes must be at most 2000 characters")
    .optional(),
  roadmapStage: z.enum([...ROADMAP_STAGES, ""]).optional(),
});
