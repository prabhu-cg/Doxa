import { z } from "zod";
import { optionalText } from "@/lib/schema-helpers";

export const itemTitleSchema = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters")
  .max(120, "Title must be at most 120 characters");

export const itemDescriptionSchema = optionalText(5000, "Description");

/** Same length limit as itemDescriptionSchema, without the
 * empty-string-to-undefined transform — for client-side forms, where a
 * plain (non-transforming) schema keeps react-hook-form's input/output
 * types identical. The server action's schema still normalizes "" to
 * undefined on submit. */
export const itemDescriptionFieldSchema = z
  .string()
  .trim()
  .max(5000, "Description must be at most 5000 characters")
  .optional();

const tagNamesSchema = z
  .array(z.string().trim().min(1).max(30))
  .max(10, "Up to 10 tags")
  .optional()
  .default([]);

const optionalId = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const createItemSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  itemTypeId: z.string().min(1, "Choose an item type"),
  categoryId: optionalId,
  tagNames: tagNamesSchema,
});

export const updateItemSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  itemTypeId: z.string().min(1, "Choose an item type"),
  statusId: z.string().min(1, "Choose a status"),
  priorityId: z.string().min(1, "Choose a priority"),
  categoryId: optionalId,
  tagNames: tagNamesSchema,
});

export const BOARD_SORTS = [
  "newest",
  "most-voted",
  "recently-updated",
] as const;
export type BoardSort = (typeof BOARD_SORTS)[number];

/** A filter param that may appear once or several times in the query string
 * (`?tag=a&tag=b`) — Next.js hands us either a bare string or a string[]
 * depending on repetition, so normalize both into a de-duped array, and an
 * absent/empty value into `undefined` (no filter), rather than `[]`. */
const multiSlug = z.preprocess((value) => {
  if (value === undefined) return undefined;
  const values = Array.isArray(value) ? value : [value];
  const cleaned = [
    ...new Set(values.filter((v): v is string => typeof v === "string" && v.length > 0)),
  ];
  return cleaned.length > 0 ? cleaned : undefined;
}, z.array(z.string()).optional());

/** Search/filter params for both the admin and public board item lists.
 * Parsed with `.safeParse` and defaulted rather than thrown on invalid
 * input — a malformed query string should degrade to "no filter," never a
 * crashed page. Each of itemType/status/category/tag accepts multiple
 * values (OR'd within the field, ANDed across fields) so the filter UI can
 * offer multi-select. */
export const boardFiltersSchema = z.object({
  q: z.string().trim().max(200).optional(),
  itemType: multiSlug,
  status: multiSlug,
  category: multiSlug,
  tag: multiSlug,
  /** Who created it: the team, or the community (customers on a public board). */
  origin: z.enum(["team", "community"]).optional(),
  sort: z.enum(BOARD_SORTS).optional().default("newest"),
});

/** The parsed shape on a successful parse. Callers fall back to
 * `Partial<BoardFilters>` (an empty object) on a failed parse — see
 * boardFiltersSchema's doc comment — so every field is read as
 * possibly-undefined either way. */
export type BoardFiltersValues = z.infer<typeof boardFiltersSchema>;
