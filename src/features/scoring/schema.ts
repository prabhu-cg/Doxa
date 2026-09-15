import { z } from "zod";
import { optionalText } from "@/lib/schema-helpers";

export const scoreCriterionNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(40, "Name must be at most 40 characters");

export const scoreCriterionWeightSchema = z.coerce
  .number()
  .min(0.1, "Weight must be at least 0.1")
  .max(10, "Weight must be at most 10");

export const scoreCriterionSchema = z.object({
  name: scoreCriterionNameSchema,
  description: optionalText(200, "Description"),
  weight: scoreCriterionWeightSchema,
});

/** Same fields as scoreCriterionSchema, with `weight` kept as a plain
 * string — for the client-side form, where react-hook-form's input/output
 * types must match (z.coerce.number()'s input type is `unknown`, which
 * doesn't line up with a text `<input>`'s string value). See
 * itemDescriptionFieldSchema (features/items/schema.ts) for the same
 * pattern; the form converts to a number before calling the Server
 * Action, which still validates with scoreCriterionSchema. */
export const scoreCriterionFieldSchema = z.object({
  name: scoreCriterionNameSchema,
  description: z
    .string()
    .trim()
    .max(200, "Description must be at most 200 characters")
    .optional(),
  weight: z
    .string()
    .trim()
    .refine((value) => {
      const n = Number(value);
      return !Number.isNaN(n) && n >= 0.1 && n <= 10;
    }, "Weight must be between 0.1 and 10"),
});

/** A 1-5 scale, the same shape regardless of what the criterion measures
 * (impact, effort, confidence, ...) — keeps the scoring UI a single
 * uniform control rather than a different input per dimension. */
export const scoreValueSchema = z.coerce
  .number()
  .int("Score must be a whole number")
  .min(1, "Score must be between 1 and 5")
  .max(5, "Score must be between 1 and 5");
