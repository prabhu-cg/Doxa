# Doxa

A generic community feedback, prioritisation and decision platform:
**Collect → Discuss → Understand → Prioritise → Decide → Communicate.**

This repository is being built in sequential, phase-gated prompts.
**Phase 0 (foundation) and Phase 1 (auth & tenancy) are complete.**
Spaces, boards, items, and every later-phase feature are not yet built.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui ·
Supabase (Postgres, Auth, Storage) · Prisma 7 · Zod · React Hook Form ·
Tiptap · Resend · Vitest · Playwright · pnpm. See `docs/tech-stack.md` for
exact pins and why.

## Docs

- [`docs/architecture.md`](docs/architecture.md) — product shape, system
  style, request-flow rules
- [`docs/tech-stack.md`](docs/tech-stack.md) — fixed stack, version pins
  and why
- [`docs/coding-conventions.md`](docs/coding-conventions.md) — TypeScript,
  component, and naming conventions
- [`docs/environment.md`](docs/environment.md) — environment variable
  reference and setup
- [`docs/security-principles.md`](docs/security-principles.md) — security
  rules that apply to every phase
- [`docs/multi-tenancy.md`](docs/multi-tenancy.md) — tenant isolation rules
- [`docs/project-structure.md`](docs/project-structure.md) — `src/` layout
  and placement rules

## Local setup

```bash
cp .env.example .env.local   # fill in Supabase project + DB credentials
pnpm install                 # also runs `prisma generate` via postinstall
pnpm dev
```

## Scripts

| Command                        | Purpose                        |
| ------------------------------ | ------------------------------ |
| `pnpm dev`                     | Start the dev server           |
| `pnpm build`                   | Production build               |
| `pnpm lint`                    | ESLint                         |
| `pnpm typecheck`               | `tsc --noEmit`                 |
| `pnpm test`                    | Vitest (unit/integration)      |
| `pnpm test:e2e`                | Playwright (end-to-end)        |
| `pnpm format` / `format:check` | Prettier                       |
| `pnpm db:generate`             | Regenerate Prisma client       |
| `pnpm db:migrate`              | Create/apply a migration (dev) |
| `pnpm db:studio`               | Prisma Studio                  |

## What was implemented (Phase 1 — auth & tenancy)

- **Supabase Auth, full flow**: email/password registration (with the
  check-your-email state when confirmation is required), login, logout,
  forgot/reset password, and email confirmation — all via one PKCE
  callback route (`src/app/auth/callback/route.ts`) rather than parsing
  auth tokens out of a URL fragment client-side. Auth logic lives in
  `src/features/auth/` (`schema.ts`, `actions.ts`, `queries.ts`) so a
  second provider can be added later without restructuring.
- **Session refresh + route protection**: `src/proxy.ts` +
  `src/lib/supabase/middleware.ts` refresh the Supabase session on every
  request and give signed-out users a redirect-to-login with a `next`
  param (open-redirect-safe — only same-app relative paths are honoured).
  This is UX, not the authorization boundary — every page still
  independently re-verifies the session and, for org routes, membership.
- **Profile domain model**: `Profile` (`prisma/schema.prisma`) mirrors only
  what the app needs from a Supabase auth user (display name, optional
  username, avatar URL) — no credentials duplicated. A database trigger
  auto-provisions the row on signup; see
  `prisma/migrations/*_add_auth_profiles_organizations/migration.sql` and
  the "Known gap" section of `docs/multi-tenancy.md` for the one
  deliberate trade-off (no DB-level FK back to `auth.users`, and why).
- **Organisations & membership**: `Organization` + `Membership`
  (`OWNER`/`ADMIN`/`MEMBER`) models; creating an org makes the creator its
  owner. Role checks are centralized in
  `src/features/organizations/permissions.ts` (a capability matrix, not
  scattered `role === 'ADMIN'` checks), so adding a role later is a
  one-file change.
- **Tenant isolation**: `getMembershipForSlug` returns the same `null` for
  "no such org" and "org exists, you're not a member" — a valid member of
  one org gets a plain 404 hitting another org's slug, never a data leak
  or a tell. See `docs/multi-tenancy.md`.
- **Onboarding**: one combined form (name + first org name) for brand-new
  users; `/org/new` for creating additional organisations later.
- **UI**: login, register, forgot/reset password, org creation, org
  switcher (dropdown, shared `AppShell`), org settings (rename, member
  list, leave-organisation with a sole-owner guard), profile settings.
  Fixed two accessibility gaps in the shadcn `Card` primitive along the
  way — `CardTitle`/`CardDescription` rendered as `<div>`s with no
  semantic heading, patched to `<h3>`/`<p>` (`src/components/ui/card.tsx`).
- **Testing**: `src/features/organizations/organizations.integration.test.ts`
  exercises tenant isolation and role logic directly against the real
  Supabase Postgres instance (real member vs. real non-member vs.
  nonexistent org; role hierarchy; sole-owner leave guard; unique
  membership constraint; cascade delete). `e2e/auth.spec.ts` and
  `e2e/organizations.spec.ts` cover registration, login/logout, protected
  routes, onboarding, org switching, settings, and the cross-tenant IDOR
  scenario end-to-end, using a Supabase-admin-provisioned pre-confirmed
  test user (bypassing real email delivery for test setup only — see
  `e2e/utils/test-users.ts`).

## What was implemented (Phase 0)

- **Next.js 16 App Router project** scaffolded under `src/`, TypeScript
  strict mode, ESLint + Prettier (with Tailwind class sorting) configured.
- **Design tokens** — colors, radius, and font (Manrope) extracted directly
  from `assesslyapp.vercel.app` (shadcn/ui "New York" style, warm-neutral
  base + burnt-orange primary) and applied as the Tailwind/shadcn theme in
  `src/app/globals.css`, with light and dark variants. Core shadcn/ui
  primitives installed (button, card, form, dialog, dropdown, tabs, sheet,
  toast/sonner, etc.).
- **Environment configuration** — `src/lib/env/client.ts` and
  `src/lib/env/server.ts`, Zod-validated, with the server schema
  hard-guarded by the `server-only` package so a secret can't accidentally
  end up in a client bundle. `.env.example` documents every variable.
- **Supabase client wiring** — browser client
  (`src/lib/supabase/browser-client.ts`), server/session client
  (`src/server/supabase/server-client.ts`), and an admin/service-role
  client (`src/server/supabase/admin-client.ts`) that's explicitly
  documented as bypassing RLS. Built but unused in Phase 0 — no auth
  flows, protected routes, or middleware yet (that came with Phase 1,
  above).
- **Prisma 7 wired to Supabase Postgres** via the `@prisma/adapter-pg`
  driver adapter (required in Prisma 7 — no bundled native engine),
  the new `prisma-client` generator, and `prisma7.config.ts` for CLI
  configuration. Domain models were intentionally deferred to Phase 1 —
  see that section above. Prisma client singleton at `src/server/db.ts`.
- **Feature-oriented `src/` structure**: `app/`, `components/ui/`,
  `features/` (empty, documented convention), `lib/`, `server/`, `types/`.
- **Testing**: Vitest configured with a passing sample unit test
  (`src/lib/utils.test.ts`); Playwright configured with a passing sample
  e2e test (`e2e/home.spec.ts`) that boots a production build and checks
  the homepage renders.
- **Vercel project linked** (`doxa` under the `prabhu-cg-protonme's
projects` team) for future env var management and deployment.
- **Foundation documentation** — see the Docs section above.

## Assumptions made (flag if any are wrong)

- **Dark mode primary color**: the reference app's captured dark-mode
  tokens used a near-white primary button and an apparently-unused blue
  `--sidebar-primary`, which read as an unfinished/inconsistent dark theme
  rather than a deliberate design choice. Doxa's dark theme instead uses a
  lightened version of the same brand orange (`#e2680f`) for `--primary`,
  `--accent`, `--ring`, and `--sidebar-primary`, keeping the neutral
  background/border/muted values as captured. Swap this if an explicit
  dark-mode design is provided later.
- **Prisma pinned to 7.10.0** (not the `latest` npm dist-tag, which
  currently resolves to an `8.0.0-rc` release candidate) to keep the
  foundation on a stable release. See `docs/tech-stack.md`.
- **Supabase provisioned manually**, not via the Vercel Marketplace
  integration — the marketplace flow required accepting Supabase's
  marketplace terms interactively in a browser, which wasn't done in this
  session; credentials were supplied directly instead. `vercel integration
add supabase` remains available later if that's preferred.
- **Rate limiting and audit logging are still documented as principles
  only** (`docs/security-principles.md`), with no code yet — Phase 1 adds
  the first real mutations/endpoints, but neither was in this phase's
  brief. Worth revisiting once Phase 2+ adds higher-value targets (public
  forms, webhooks).
- **No DB-level FK from `Profile` to `auth.users`, and no RLS policies on
  the Phase 1 tables** — both were deliberately tried and reverted; see
  "Known gap" and "Row Level Security" in `docs/multi-tenancy.md` for the
  concrete reasoning (an `auth`-schema-aware Prisma migration risks a
  drift-detection reset against a real Supabase project; RLS wouldn't be
  enforced anyway since Prisma connects as the `postgres` role, not
  through PostgREST).
- **Username is optional and not required during onboarding** — the
  brief said "username if required" for the profile model; Doxa doesn't
  need one to function (display name suffices), so it's a nullable field
  editable later from Profile settings, keeping the first-run flow to a
  single form (name + org name).
- **No RLS-based "who can see this org" filtering; app-layer checks only**
  by design — see `docs/multi-tenancy.md`.

## Not implemented in this phase (by design)

Spaces, boards, items, voting, comments, roadmap, AI, billing,
integrations — see the phased build plan for what's next. Also
explicitly out of scope for Phase 1: social login (only email/password),
member invitations (the only way into an org right now is creating it —
membership beyond the creator isn't wired up until a later phase adds
invites), and organisation branding/settings beyond the name (Phase 5).
