/**
 * Only ever redirect to a same-app relative path. A `next` value comes from the
 * URL, so following it as-is would be an open redirect.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback: string,
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

/** `/login` or `/signup`, keeping the page the visitor came from so they land
 * back on it once they are signed in. */
export function authPath(
  page: "login" | "signup",
  next: string | null | undefined,
): string {
  const safe = safeNextPath(next, "");
  return safe ? `/${page}?next=${encodeURIComponent(safe)}` : `/${page}`;
}
