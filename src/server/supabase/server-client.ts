import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env/client";

/**
 * Supabase client for use in Server Components, Server Actions and Route
 * Handlers. Runs as the authenticated end user (anon key + their session
 * cookie) — RLS still applies. Create a new instance per request; never
 * cache or share this across requests.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Components can't set cookies — this throws only when
          // called from a context that isn't a Server Action or Route
          // Handler. Session refresh from Server Components is handled by
          // the auth middleware introduced in Phase 1.
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Ignored: called from a Server Component render.
          }
        },
      },
    },
  );
}
