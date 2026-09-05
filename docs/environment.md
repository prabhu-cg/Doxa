# Environment configuration

Doxa splits environment variables into two Zod-validated schemas, so a
missing or malformed variable fails fast at startup with a clear error
instead of surfacing as a confusing runtime bug later:

- **`src/lib/env/client.ts`** — `NEXT_PUBLIC_*` variables. Safe to import
  from Client Components; ends up in the browser bundle.
- **`src/lib/env/server.ts`** — everything else. Imports the `server-only`
  package, so a Client Component that tries to import this module fails
  the build rather than silently bundling a secret into client JS.

Local values live in `.env.local` (gitignored, never committed). The
committed template is `.env.example` — copy it, fill in real values, don't
commit the copy.

## Variable reference

| Variable                        | Where  | Purpose                                                                                  |
| ------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | client | Supabase project URL                                                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Supabase anon/public key — RLS-constrained                                               |
| `NEXT_PUBLIC_APP_URL`           | client | Canonical app URL, for absolute links/metadata                                           |
| `DATABASE_URL`                  | server | Pooled Postgres connection (transaction pooler) — used at runtime                        |
| `DIRECT_URL`                    | server | Direct (non-pooled) Postgres connection — used by Prisma Migrate                         |
| `SUPABASE_SERVICE_ROLE_KEY`     | server | Bypasses RLS entirely — admin operations only, see `src/server/supabase/admin-client.ts` |
| `RESEND_API_KEY`                | server | Transactional email — optional until a phase that sends email                            |
| `RESEND_FROM_EMAIL`             | server | Verified sender address for Resend                                                       |

## Never

- Never read `process.env.SUPABASE_SERVICE_ROLE_KEY` (or any server-only
  variable) from a Client Component or from `src/lib/`. It belongs behind
  `src/server/`.
- Never log a full connection string or key, even server-side — logs are
  a leak surface too.
- Never commit `.env.local` or paste real secrets into `.env.example`.

## Local setup

```bash
cp .env.example .env.local
# fill in Supabase URL / anon key / service role key / DB connection strings
pnpm install
pnpm db:generate
pnpm dev
```

`pnpm install` also runs `prisma generate` via a `postinstall` hook, so the
generated client (`src/generated/prisma/`) stays in sync with the schema
without a manual step after every `git pull`.
