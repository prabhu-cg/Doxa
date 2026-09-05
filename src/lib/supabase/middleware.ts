import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env/client";

// The authenticated app surface — everything else (the marketing site,
// auth pages, legal pages, etc.) is public. This is an allowlist of what
// requires a session, not the other way around, since Doxa is a public
// marketing site first and an app second.
const PROTECTED_PATH_PREFIXES = ["/app", "/onboarding", "/org", "/profile"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Runs on every request (see proxy.ts). Two jobs, both load-bearing:
 *
 * 1. Refresh the Supabase session token and write the refreshed cookie
 *    back onto the response — without this, sessions silently expire
 *    mid-use. This is the ONLY place that happens; Server Components
 *    can't set cookies at all (see server-client.ts).
 * 2. A coarse, UX-level redirect for signed-out users hitting a
 *    protected path, and signed-in users hitting /login or /signup.
 *    This is not the authorization boundary — every page/query still
 *    re-verifies the user and, for org routes, membership (see
 *    docs/multi-tenancy.md). It just avoids a flash of a page that's
 *    about to bounce anyway.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtectedPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}
