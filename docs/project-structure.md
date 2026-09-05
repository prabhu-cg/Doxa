# Project structure

```
src/
  app/
    (marketing)/  # Public site: layout + homepage + features/pricing/
                  # why-doxa/about/contact/privacy/terms/security.
                  # _sections/ holds homepage-only section components.
    (auth)/       # /login, /signup, /forgot-password, /reset-password
    app/          # Authenticated entry point (/app) — see docs/architecture.md
    org/, onboarding/, profile/, auth/callback/  # Authenticated app + auth flows
    sitemap.ts, robots.ts                        # SEO file conventions
  components/
    ui/         # shadcn/ui primitives — presentation only, no business logic
    marketing/  # Marketing-site-only presentational components (Hero,
                # FeatureCard, PricingCard, ProductPreview mockups, ...)
  features/     # Domain modules (auth, organizations, profile, contact, ...)
  lib/          # Generic, reusable, non-domain code
    env/        # Zod-validated environment variables (client vs server split)
    supabase/   # Browser Supabase client factory + proxy session helper
    analytics.ts # Event-tracking abstraction (no provider wired up yet)
    pricing-plans.ts # Shared plan data (homepage preview + /pricing page)
    utils.ts    # cn() and other framework-agnostic helpers
  server/       # Server-only code (imports "server-only")
    db.ts       # Prisma client singleton
    supabase/   # Server + admin Supabase client factories
  types/        # Cross-feature shared types
prisma/
  schema.prisma # Prisma schema + migrations
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
- **`components/marketing/`** holds presentational components only the
  public site uses (Hero, FeatureCard, PricingCard, ProductPreview
  mockups, ...). If the authenticated app ever needs one of these, promote
  it to `components/` directly rather than importing across that
  boundary.
- **Link-styled-as-a-button?** Use `components/link-button.tsx`
  (`LinkButton`), not `<Button render={<Link>} />`. Base UI's `Button`
  always exposes `role="button"` on whatever it renders, even an `<a>` —
  wrong accessible semantics for a control that navigates. `LinkButton`
  applies the same `buttonVariants` styling to a plain `Link`, so the
  accessible role matches what it actually does.

See `docs/coding-conventions.md` for naming and code-style rules, and
`docs/multi-tenancy.md` for how feature modules must enforce tenant
isolation.
