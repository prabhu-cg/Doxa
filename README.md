# Doxa

A generic community feedback, prioritisation and decision platform:
**Collect → Discuss → Understand → Prioritise → Decide → Communicate.**

This repository is being built in sequential, phase-gated prompts.
**Phase 0 (foundation), Phase 1 (auth & tenancy), and Phase 0.5 (marketing
site) are complete.** Spaces, boards, items, and every later-phase feature
are not yet built.

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

## What was implemented (Phase 0.5 — marketing site)

- **Public routes**: `/`, `/features`, `/pricing`, `/why-doxa`, `/about`,
  `/contact`, `/privacy`, `/terms`, `/security`, plus `/login` and
  `/signup` (renamed from Phase 1's `/register` to match the marketing
  copy). All under `src/app/(marketing)/` with a shared
  `MarketingHeader`/`MarketingFooter` layout, except the auth pages which
  keep Phase 1's centered-card layout.
- **Routing split**: `/` is now the public homepage, not an authenticated
  redirect — the authenticated entry point moved to `/app`. `src/proxy.ts`
  was inverted to allowlist the _protected_ surface instead of the public
  one, since most of the site is public now. See "Public site vs.
  authenticated app" in `docs/architecture.md`.
- **Homepage**: hero (with a `BoardPreview` mockup built from real
  shadcn primitives — votes, comments, priority, and one "Decided ·
  Planned" item, not a generic screenshot), problem, the six-step core
  loop, "votes are a signal, not a decision" differentiation, feature
  highlights (each honestly marked live or planned), generic-by-design,
  simple-by-default, a dedicated decisions section, use cases, a
  community→decision workflow diagram, a pricing preview, and a final
  CTA. Composed from ~11 colocated section components
  (`src/app/(marketing)/_sections/`) plus shared, reusable ones
  (`src/components/marketing/`: `Hero`, `SectionHeading`, `FeatureCard`/
  `FeatureGrid`, `StepCard`, `UseCaseCard`, `PricingCard`, `CTASection`,
  `FAQ`, three more product-preview mockups).
- **Honesty about what's live**: only Organisations (creation, roles,
  settings) is marked as shipped anywhere on the site — every other
  capability (voting, boards, prioritisation, decisions, roadmaps, AI,
  API, etc.) is explicitly labeled "Planned." No fabricated customers,
  testimonials, user counts, logos, or certifications anywhere — the
  security page explicitly states Doxa holds no SOC 2/ISO 27001/HIPAA
  certification, and the legal pages are structured placeholders with an
  explicit TODO banner for legal review.
- **Pricing architecture**: Free/Pro/Business plan data lives in one
  shared `src/lib/pricing-plans.ts` (consumed by both the homepage preview
  and the full `/pricing` page) with placeholder `priceLabel`s ("$0",
  "Coming soon") — a later phase wires real Stripe prices in without
  restructuring the comparison table, `PricingCard`, or FAQ.
- **Contact form**: `src/features/contact/` (Zod schema, Server Action).
  Sends via Resend when `RESEND_API_KEY` + `RESEND_FROM_EMAIL` +
  `CONTACT_NOTIFICATION_EMAIL` are configured; otherwise logs
  server-side and still reports success to the visitor — the seam a
  later phase connects real delivery through without touching the form.
- **Analytics abstraction**: `src/lib/analytics.ts` defines the event
  names from the brief (`marketing_cta_clicked`, `signup_started`,
  `signup_completed`, `pricing_viewed`, `contact_submitted`) and a
  `trackEvent()` that's a dev-only console log today — wired up on
  contact-form submission as a working example. Not instrumented on
  every marketing CTA link, to avoid forcing otherwise-static Server
  Components into Client Components for a no-op.
- **SEO**: per-page `metadata` (title/description/canonical/OG/Twitter),
  a shared `metadataBase` and title template in the root layout,
  `src/app/sitemap.ts` and `src/app/robots.ts` (Next's file-convention
  equivalents of `/sitemap.xml` and `/robots.txt`, which disallow the
  authenticated app surface). JSON-LD structured data
  (`WebSite`/`Organization`/`SoftwareApplication` on the homepage,
  `FAQPage` on `/pricing`, matching content actually on those pages) via
  a small `JsonLd` component.
- **Accessibility fixes found along the way**: fixed a second shadcn gap —
  `Button`/`SheetClose`/`DialogClose` force `role="button"` onto whatever
  they render via the `render` prop, even a real `<a>` — wrong semantics
  for a link styled as a button, and it broke the mobile menu and CTA
  link clicks. Replaced every such usage with a new `LinkButton`
  (`src/components/link-button.tsx`) that applies `buttonVariants` to a
  plain `Link` instead. Reduced-motion CSS added to `globals.css`.
  Mobile nav (Sheet-based) verified with a real viewport-resized e2e test.
- **Testing**: `e2e/marketing.spec.ts` — every public route renders with
  its expected heading, header nav + footer links resolve, the mobile
  menu opens and navigates, the full "Home → Features → Pricing → Start
  Free → Signup" journey, contact form validation (empty fields) and
  successful submission, and SEO checks (title/meta description,
  `/sitemap.xml` contents, `/robots.txt` contents). Contact form Zod
  schema also covered by a Vitest unit test
  (`src/features/contact/schema.test.ts`). `e2e/home.spec.ts` (Phase
  0/1's smoke test) updated to check `/app`'s redirect instead of `/`,
  since `/` is no longer an auth-gated route.

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

- **`/register` renamed to `/signup`, and `/` now means the public
  homepage** — Phase 0.5 explicitly lists `/signup` as a required route
  and `/` as the marketing homepage, which conflicts with Phase 1's
  routing (`/register`, and `/` as the authenticated redirect). Resolved
  by renaming the route and moving the authenticated entry point to
  `/app` — see "Public site vs. authenticated app" in
  `docs/architecture.md`. This is a routing change, not an architecture
  or auth-logic change.
- **No OG/Twitter image** — metadata includes title/description for
  social sharing cards but no image, since generating one would mean
  fabricating a product screenshot that doesn't reflect a real,
  implemented UI. A later phase can add a proper OG image (static asset
  or `opengraph-image.tsx`) once there's real product UI to depict.
- **Analytics events aren't wired into every CTA** — see "What was
  implemented (Phase 0.5)" above; `trackEvent()` exists and is
  demonstrated on the contact form, not on every link, to keep the rest
  of the site as Server Components.
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

## Not implemented (by design)

Spaces, boards, items, voting, comments, roadmap, AI, billing,
integrations — see the phased build plan for what's next. Also out of
scope: social login (only email/password), member invitations (the only
way into an org right now is creating it), and organisation
branding/settings beyond the name (Phase 5).

**Phase 0.5 specifically did not implement**: real pricing (Stripe or
otherwise — placeholder plan copy only), a documentation/help site,
customer stories or case studies (would require real customers), any AI
capability, an API or webhooks, a wired-up analytics provider (PostHog or
otherwise), or a favicon/OG image asset. See "What was implemented (Phase
0.5)" above for what the pricing architecture, contact form, and
analytics abstraction leave ready for those to plug into later.
