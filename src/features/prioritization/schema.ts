import { z } from "zod";

export const PRIORITIZATION_SORTS = [
  "votes",
  "priority",
  "status",
  "type",
  "category",
  "score",
] as const;
export type PrioritizationSort = (typeof PRIORITIZATION_SORTS)[number];

/** Same "parse, default, never throw" shape as boardFiltersSchema
 * (features/items/schema.ts) — a malformed query string degrades to "no
 * filter," never a crashed page. */
export const prioritizationFiltersSchema = z.object({
  itemType: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(PRIORITIZATION_SORTS).optional().default("votes"),
});

export type PrioritizationFiltersValues = z.infer<
  typeof prioritizationFiltersSchema
>;
