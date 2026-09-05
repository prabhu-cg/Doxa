import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env/client";

/**
 * Supabase client for use in Client Components. Only ever has access to
 * the anon key — safe to expose to the browser. Row Level Security policies
 * (configured from Phase 1 onward) are what actually enforce authorization
 * for any query issued through this client.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
