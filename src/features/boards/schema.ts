import { z } from "zod";
import { optionalText } from "@/lib/schema-helpers";

export const boardNameSchema = z
  .string()
  .trim()
  .min(2, "Board name must be at least 2 characters")
  .max(60, "Board name must be at most 60 characters");

export const boardVisibilitySchema = z.enum(["PUBLIC", "PRIVATE"]);

export const createBoardSchema = z.object({
  name: boardNameSchema,
  description: optionalText(500, "Description"),
  spaceId: z.string().min(1, "Choose a space"),
  visibility: boardVisibilitySchema,
});

export const updateBoardSchema = z.object({
  name: boardNameSchema,
  description: optionalText(500, "Description"),
  visibility: boardVisibilitySchema,
});
