import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

/**
 * Exchanges a Supabase PKCE `code` for a session. Both the signup
 * confirmation email and the password-reset email point here (via
 * `emailRedirectTo` / `redirectTo` in src/features/auth/actions.ts), each
 * with a different `next` value.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
