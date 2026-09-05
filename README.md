# Doxa

A generic community feedback, prioritisation and decision platform:
**Collect → Discuss → Understand → Prioritise → Decide → Communicate.**

This repository is being built in sequential, phase-gated prompts. This is
**Phase 0 — Foundation & rules**. No product functionality exists yet;
Phase 1 introduces authentication and tenancy.

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
  documented as bypassing RLS. No auth flows, protected routes, or
  middleware yet — that's Phase 1.
- **Prisma 7 wired to Supabase Postgres** via the `@prisma/adapter-pg`
  driver adapter (required in Prisma 7 — no bundled native engine),
  the new `prisma-client` generator, and `prisma7.config.ts` for CLI
  configuration. `prisma/schema.prisma` intentionally defines no domain
  models yet — see the comment in that file. Prisma client singleton at
  `src/server/db.ts`.
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
- **No domain tables in `prisma/schema.prisma` yet** — Phase 0's brief says
  "don't prematurely create every future table" and "only establish the
  foundation needed for subsequent phases"; since Phase 1 (not Phase 0)
  introduces Users/Organisations, the schema currently defines only the
  generator/datasource. End-to-end connectivity against the live Supabase
  Postgres instance is confirmed on both paths — `prisma migrate dev`
  (via `DIRECT_URL`) and the app runtime's pooled connection through
  `@prisma/adapter-pg` (via `DATABASE_URL`, `src/server/db.ts`) — with no
  pending schema diff, since there are no models yet. The first real
  migration lands with Phase 1's models.
- **Supabase provisioned manually**, not via the Vercel Marketplace
  integration — the marketplace flow required accepting Supabase's
  marketplace terms interactively in a browser, which wasn't done in this
  session; credentials were supplied directly instead. `vercel integration
add supabase` remains available later if that's preferred.
- **Rate limiting and audit logging are documented as principles only**
  (`docs/security-principles.md`) with no code yet — there's no endpoint
  to rate-limit and no mutation to audit until Phase 1+ exists.

## Not implemented in this phase (by design)

Authentication, user profiles, organisations, membership/roles, org
switching, protected routes, RLS policies, spaces, boards, items, and
every later-phase feature. See the phased build plan for what's next.
