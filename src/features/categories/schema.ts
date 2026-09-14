import { z } from "zod";

export const categoryNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(40, "Name must be at most 40 characters");

export const categorySchema = z.object({ name: categoryNameSchema });
