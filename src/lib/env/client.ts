import { z } from "zod";

/**
 * Browser-safe environment variables.
 *
 * Every value here is exposed to the client bundle. Never add a secret
 * (service-role keys, database URLs, API keys) to this schema — put it in
 * `src/lib/env/server.ts` instead, which is hard-guarded against client
 * imports via the `server-only` package.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

function loadClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid client environment variables:\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}

export const clientEnv = loadClientEnv();
