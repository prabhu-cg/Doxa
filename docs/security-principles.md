# Security principles

These principles apply to every phase from here on. A phase prompt saying
"implement X" never implies suspending any of these.

## Server-side authorization

Every authorization decision is made server-side, on every request, using
the authenticated session — never by trusting a client-supplied user ID,
role, or organisation ID, and never by hiding a UI element instead of
enforcing access. See `docs/multi-tenancy.md` for the tenant-specific
version of this rule.

## Input validation

Every value crossing a trust boundary (form submission, Server Action
argument, Route Handler body, search param, webhook payload) is parsed
with Zod before use. Reject and return a clear error on invalid input;
don't coerce silently.

## Secure authentication

Supabase Auth is the only authentication mechanism (Phase 1 onward). No
custom password storage, no parallel session mechanism, no rolling a
second auth system for a specific feature.

## No secret leakage

- Server-only secrets live behind `src/server/` or the `server-only`
  package guard (`src/lib/env/server.ts`) — see `docs/environment.md`.
- The Supabase service-role client
  (`src/server/supabase/admin-client.ts`) bypasses RLS; it's for genuine
  system-level operations only, never for a code path that takes
  tenant/user input from the client without its own independent
  authorization check.

## Safe database access

All application database access goes through Prisma (typed queries, no
hand-built SQL string concatenation). If a raw query is ever unavoidable,
it uses Prisma's parameterized `$queryRaw` tagged template — never string
interpolation of user input into SQL.

## Protection against IDOR

Fetching any record by ID re-verifies that the record belongs to the
requesting user's authorized scope (their organisation, per
`docs/multi-tenancy.md`) — a valid, well-formed ID belonging to someone
else's data must still be rejected.

## Safe HTML / rich text handling

Tiptap-authored rich text (introduced with Items/Comments in Phase 2/3) is
sanitized server-side before storage and again before render — never
`dangerouslySetInnerHTML` on unsanitized user content. The specific
sanitization library is chosen when that feature is built, not assumed
here.

## Secure file handling

Supabase Storage uploads (introduced with Attachments in Phase 2+):
validate file type and size server-side before accepting an upload, use
private buckets with signed URLs by default rather than public buckets,
and never trust a client-reported MIME type alone.

## Rate limiting — architecture prepared, not yet implemented

No rate limiting exists in Phase 0 — there's nothing to rate-limit yet.
When it's needed (public-facing forms, auth endpoints, webhooks), it hooks
into Route Handlers and Server Actions at the point of mutation, keyed by
user/IP/organisation as appropriate. Choosing the specific mechanism is
deferred to the phase that needs it, to avoid introducing infrastructure
(e.g. a Redis-backed limiter) before there's a concrete requirement driving
the choice.

## Auditability

Mutations to tenant-owned data should be attributable to a user and a
timestamp. Item/Board/Decision-level activity history (Phase 3) and formal
audit logs (Phase 5) are where this becomes a first-class feature; Phase 0
just names the principle so later schema design accounts for it (e.g.
`createdBy`/`updatedBy` fields) rather than bolting it on retroactively.
