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

## How Phase 1 implements it

- `src/features/profile/queries.ts` — `requireCurrentProfile()` derives the
  user from a server-verified Supabase session (`getUser()`, not
  `getSession()`) and guarantees a `Profile` row exists.
- `src/features/organizations/queries.ts` —
  `getMembershipForSlug(slug, userId)` looks up the organisation by slug
  and independently checks membership; it returns `null` for **both** "no
  such org" and "org exists, not a member" — deliberately indistinguishable,
  so a request can't be used to enumerate organisations the caller isn't
  in. `requireOrganizationMembership(slug)` is the guard every
  `/org/[slug]/**` layout and page calls; a `null` result renders Next's
  plain `notFound()` 404, never a redirect that would reveal anything.
- `src/features/organizations/permissions.ts` — role checks
  (`canUpdateOrganization`, `canDeleteOrganization`,
  `canLeaveOrganization`) are centralized here, not scattered as
  `role === 'ADMIN'` checks in Server Actions.
- Tested directly in
  `src/features/organizations/organizations.integration.test.ts` (a real
  member vs. a real non-member vs. a nonexistent slug — same `null` shape
  for the latter two) and end-to-end in `e2e/organizations.spec.ts`
  ("cross-tenant access prevention": a second user with zero
  organisations of their own hits a known-valid org slug directly and
  gets a 404, never the organisation's name or data).

## Row Level Security: deliberately not used for these tables

Organisations/Memberships/Profiles are read and written exclusively
through Prisma, over the pooled connection string — never through a
Supabase client `.from(...)` call. Postgres RLS policies are enforced for
roles going through PostgREST with a user JWT; Prisma's connection uses
the `postgres` role directly, which bypasses RLS regardless of what
policies exist. Adding RLS policies here would be a false sense of
security with no actual enforcement, so application-layer checks (above)
are the _only_ enforcement — not a backstop to RLS, as originally
sketched in Phase 0. Revisit if a future phase ever queries these tables
via the Supabase client directly (e.g. Realtime subscriptions).

## Known gap: no DB-level FK from profiles to auth.users

`Profile.id` equals the corresponding Supabase `auth.users.id` by
convention, not a Prisma-managed foreign key. This was attempted (Prisma
`multiSchema` + a stub `auth.users` model) and reverted: once Supabase's
`auth` schema is listed in the datasource, `prisma migrate dev`'s drift
detection compares the _entire_ real auth schema (dozens of
Supabase-owned tables) against our migration history and offers to
**reset the database** to reconcile — not safe to run against a live
Supabase project. Referential integrity going forward (auth user →
profile) is instead provided by a database trigger
(`prisma/migrations/*_add_auth_profiles_organizations/migration.sql`)
that auto-creates a Profile row on signup — verified working in this
phase. There is no cascade the other direction: deleting an auth user
does **not** cascade-delete their Profile/Memberships (confirmed by
testing), since there's no FK to hang a cascade off. Account deletion
isn't a Phase 1 feature; when it is built, it must explicitly delete the
Profile (which cascades to Memberships) alongside the auth user.
