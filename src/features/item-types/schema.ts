import { z } from "zod";
import { optionalText } from "@/lib/schema-helpers";

export const itemTypeNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(40, "Name must be at most 40 characters");

export const itemTypeSchema = z.object({
  name: itemTypeNameSchema,
  description: optionalText(200, "Description"),
});
