# Multi-tenancy rules

Doxa is multi-tenant from day one. Conceptual hierarchy:

```
User → Organisation membership (role) → Space → Board → Item
```

Every record below Organisation is tenant-owned — it belongs to exactly one
Organisation, directly (`organizationId` column) or transitively (through
its Space/Board/Item parent). Tenant isolation is a critical security
requirement, not a nice-to-have.

## The one rule that matters

**Never trust an organisation ID, space ID, or board ID supplied by the
browser as authorization.** A client can send any ID it wants — a hidden
form field, a query param, a JSON body — regardless of what the UI shows.
The server must independently verify, on every single request:

1. Who the authenticated user is (from the verified Supabase session, not
   a client-supplied user ID).
2. That this user is actually a member of the organisation the request
   claims to act on.
3. That the requested record actually belongs to that organisation (so a
   valid member of Org A can't reach Org B's data by guessing/enumerating
   an ID — this is the tenant-scoped version of IDOR).

This check happens in the Server Action / Route Handler / query function
itself — never only in middleware, and never only by hiding a UI element.
Hiding a button is not authorization.

## Where this gets enforced (once Phase 1 lands)

- **Database layer**: Supabase Row Level Security policies scoped to
  organisation membership, as a defense-in-depth backstop.
- **Application layer**: every feature module's `actions.ts` / `queries.ts`
  re-derives the session user and re-checks membership before touching
  Prisma — RLS is a backstop, not a substitute for this check, because
  Prisma queries running through the service-role-equivalent connection
  string are not automatically RLS-scoped the way a Supabase client call is.
- **Route Handlers / webhooks**: same rule — verify the caller and the
  tenant scope inside the handler, don't assume the route path implies
  authorization.

## What Phase 0 does and doesn't set up

Phase 0 documents this rule and prepares the environment/client plumbing
(`src/server/supabase/server-client.ts`, `src/server/db.ts`) that Phase 1's
actual membership checks will run through. It does not implement
Organisation, Space, Board, or Item models, RLS policies, or membership
checks yet — those are Phase 1 (auth/tenancy) and Phase 2 (core Doxa)
concerns.
