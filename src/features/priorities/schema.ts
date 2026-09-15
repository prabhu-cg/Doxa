import { z } from "zod";

export const priorityNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(40, "Name must be at most 40 characters");

export const priorityColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #64748b")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const prioritySchema = z.object({
  name: priorityNameSchema,
  color: priorityColorSchema,
});
