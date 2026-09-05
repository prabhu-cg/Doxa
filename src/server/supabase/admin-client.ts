import "server-only";
import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env/client";
import { serverEnv } from "@/lib/env/server";

/**
 * Privileged Supabase client using the service-role key. Bypasses Row Level
 * Security entirely.
 *
 * Only use this for operations that must legitimately act outside a single
 * user's permissions (e.g. system-initiated background work). It must never
 * be reachable from a code path that takes tenant/org input from the client
 * without an independent, server-verified authorization check — this client
 * does not enforce tenant isolation for you.
 */
export function createSupabaseAdminClient() {
  return createClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
