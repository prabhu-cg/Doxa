import { z } from "zod";

export const tagNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(30, "Name must be at most 30 characters");

export const tagSchema = z.object({ name: tagNameSchema });
