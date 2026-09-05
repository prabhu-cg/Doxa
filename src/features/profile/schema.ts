import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(80, "Name must be at most 80 characters"),
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9_-]+$/i, "Only letters, numbers, - and _ are allowed")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .optional()
    .or(z.literal("")),
});
