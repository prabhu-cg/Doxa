import "server-only";
import { z } from "zod";

/**
 * Server-only environment variables.
 *
 * The `server-only` import above makes the build fail if this module is
 * ever imported from a Client Component, preventing secrets from being
 * bundled into browser JavaScript.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.email().optional(),
  CONTACT_NOTIFICATION_EMAIL: z.email().optional(),
});

function loadServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    CONTACT_NOTIFICATION_EMAIL: process.env.CONTACT_NOTIFICATION_EMAIL,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}

export const serverEnv = loadServerEnv();
