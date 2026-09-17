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

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

const optionalHexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Colour must be a hex value like #f97316")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

/** Gated behind the `branding` Plan entitlement when either field is
 * actually set to something non-default — see
 * features/organizations/actions.ts#updateOrganizationBranding. */
export const updateOrganizationBrandingSchema = z.object({
  logoUrl: optionalUrl,
  accentColor: optionalHexColor,
});

const terminologyWordSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(30, "Must be at most 30 characters");

export const updateOrganizationTerminologySchema = z.object({
  itemTerminologySingular: terminologyWordSchema,
  itemTerminologyPlural: terminologyWordSchema,
});
