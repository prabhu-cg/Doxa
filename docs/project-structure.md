# Project structure

```
src/
  app/          # Next.js App Router: routes, layouts, route handlers
  components/
    ui/         # shadcn/ui primitives — presentation only, no business logic
  features/     # Domain modules (organisations, items, voting, ...).
                # Empty in Phase 0 — see src/features/README.md
  lib/          # Generic, reusable, non-domain code
    env/        # Zod-validated environment variables (client vs server split)
    supabase/   # Browser Supabase client factory
    utils.ts    # cn() and other framework-agnostic helpers
  server/       # Server-only code (imports "server-only")
    db.ts       # Prisma client singleton
    supabase/   # Server + admin Supabase client factories
  types/        # Cross-feature shared types
prisma/
  schema.prisma # Prisma schema (generator + datasource only in Phase 0)
  migrations/   # Created once the first migration runs
docs/           # Foundation documentation (this directory)
e2e/            # Playwright end-to-end specs
```

## Placement rules

- **A file goes in `features/<name>/` if it's specific to one domain
  concept.** Everything reusable across features goes in `lib/` (generic
  helpers, safe for client or server) or `server/` (server-only, secrets,
  privileged clients).
- **`components/ui/` stays presentation-only.** No data fetching, no
  Server Actions, no business rules — those belong in a feature module or a
  Server Component that passes data down as props.
- **Anything importing a secret (service-role key, `DATABASE_URL`) must
  live under `server/` or be gated by the `server-only` package**, so a
  stray client import fails the build instead of leaking a secret into the
  browser bundle.
- **New shadcn primitives** are added with `pnpm dlx shadcn@latest add
<component>` — don't hand-write a component shadcn already ships.

See `docs/coding-conventions.md` for naming and code-style rules, and
`docs/multi-tenancy.md` for how feature modules must enforce tenant
isolation.
