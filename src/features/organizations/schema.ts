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

const optionalHexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Colour must be a hex value like #f97316")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

/** Gated behind the `branding` Plan entitlement when the colour is actually
 * set to something — see
 * features/organizations/actions.ts#updateOrganizationAccentColor. */
export const updateOrganizationAccentColorSchema = z.object({
  accentColor: optionalHexColor,
});

/** Logos are uploaded to storage; these are the files the upload accepts. */
export const LOGO_MAX_BYTES = 512 * 1024;
export const LOGO_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
} as const;

/** The reason a file can't be a logo, or null when it can. */
export function logoFileError(file: { type: string; size: number }) {
  if (!(file.type in LOGO_TYPES)) {
    return "Use a PNG, JPG, WebP or SVG image";
  }
  if (file.size === 0) return "That file is empty";
  if (file.size > LOGO_MAX_BYTES) {
    return `The logo must be ${LOGO_MAX_BYTES / 1024} KB or smaller`;
  }
  return null;
}

const terminologyWordSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(30, "Must be at most 30 characters");

export const updateOrganizationTerminologySchema = z.object({
  itemTerminologySingular: terminologyWordSchema,
  itemTerminologyPlural: terminologyWordSchema,
});
