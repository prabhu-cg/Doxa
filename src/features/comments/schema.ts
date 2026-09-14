import { z } from "zod";

export const commentBodySchema = z
  .string()
  .trim()
  .min(1, "Comment can't be empty")
  .max(3000, "Comment must be at most 3000 characters");

export const createCommentSchema = z.object({
  body: commentBodySchema,
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  body: commentBodySchema,
});
