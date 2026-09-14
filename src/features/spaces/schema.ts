import { z } from "zod";
import { optionalText } from "@/lib/schema-helpers";

export const spaceNameSchema = z
  .string()
  .trim()
  .min(2, "Space name must be at least 2 characters")
  .max(60, "Space name must be at most 60 characters");

export const createSpaceSchema = z.object({
  name: spaceNameSchema,
  description: optionalText(500, "Description"),
});

export const updateSpaceSchema = createSpaceSchema;
