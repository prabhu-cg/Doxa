import { z } from "zod";

export const statusNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(40, "Name must be at most 40 characters");

export const statusColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #64748b")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const statusSchema = z.object({
  name: statusNameSchema,
  color: statusColorSchema,
});
