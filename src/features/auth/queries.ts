import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

/**
 * Verified against Supabase's Auth server (not just the session cookie) —
 * `getUser()`, never `getSession()`, for anything authorization-related.
 * See docs/security-principles.md.
 *
 * Memoised per request: a public page asks from its shell, its page, and the
 * item in its drawer, and each ask is otherwise a round trip to the auth server.
 */
export const getAuthenticatedSupabaseUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireAuthenticatedSupabaseUser() {
  const user = await getAuthenticatedSupabaseUser();
  if (!user) redirect("/login");
  return user;
}
