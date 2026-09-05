import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

/**
 * Verified against Supabase's Auth server (not just the session cookie) —
 * `getUser()`, never `getSession()`, for anything authorization-related.
 * See docs/security-principles.md.
 */
export async function getAuthenticatedSupabaseUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuthenticatedSupabaseUser() {
  const user = await getAuthenticatedSupabaseUser();
  if (!user) redirect("/login");
  return user;
}
