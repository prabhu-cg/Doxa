import { z } from "zod";

/**
 * A trimmed, optional single-line/textarea field. An empty string (what a
 * cleared form input submits) normalizes to `undefined` rather than being
 * persisted as `""`.
 */
export function optionalText(maxLength: number, label = "This field") {
  return z
    .string()
    .trim()
    .max(maxLength, `${label} must be at most ${maxLength} characters`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));
}
