import { z } from "zod";

export const organizationNameSchema = z
  .string()
  .trim()
  .min(2, "Organisation name must be at least 2 characters")
  .max(60, "Organisation name must be at most 60 characters");

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
});

export const updateOrganizationSchema = z.object({
  name: organizationNameSchema,
});

export const onboardingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(80, "Name must be at most 80 characters"),
  organizationName: organizationNameSchema,
});
