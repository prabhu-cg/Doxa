# Fixed technology stack

This stack is fixed for the whole build. Every phase's prompt will repeat:
**do not redesign, replace, or introduce alternative technologies.**

| Concern                | Technology                                    |
| ---------------------- | --------------------------------------------- |
| Framework              | Next.js 16, App Router                        |
| UI                     | React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Database               | Supabase PostgreSQL                           |
| ORM                    | Prisma (7.x)                                  |
| Auth                   | Supabase Auth                                 |
| File storage           | Supabase Storage                              |
| Mutations (internal)   | Server Actions                                |
| APIs / webhooks        | Route Handlers                                |
| Validation             | Zod                                           |
| Forms                  | React Hook Form                               |
| Rich text              | Tiptap                                        |
| Hosting                | Vercel                                        |
| Email                  | Resend                                        |
| Unit/integration tests | Vitest                                        |
| E2E tests              | Playwright                                    |
| Package manager        | pnpm                                          |

**Explicitly excluded** — do not introduce these, even to solve a real
problem, without stopping to confirm with the product owner first: Redux,
Firebase, MongoDB, Drizzle, Clerk, Auth.js/NextAuth, tRPC, GraphQL, any ORM
other than Prisma.

## Version notes (why pins look the way they do)

- **Prisma is pinned to `7.10.0`** (exact, not `^7.10.0`) for both `prisma`
  and `@prisma/client`. At the time Phase 0 was built, npm's `latest` dist-tag
  for `prisma` pointed at an `8.0.0-rc.*` release candidate — a pre-release,
  not a stable version. `7.10.0` is the last stable release. Re-evaluate the
  pin deliberately (not via `pnpm up`) once Prisma 8 ships stable.
- **Prisma 7 requires a driver adapter** for SQL databases — there is no
  bundled native engine binary any more. This build uses `@prisma/adapter-pg`
  - `pg`. It also uses the new `prisma-client` generator (TS output to
    `src/generated/prisma`), not the legacy `prisma-client-js` generator, and
    the new `prisma7.config.ts` config file instead of a `datasource url` in
    `schema.prisma`. See the [official v7 upgrade
    guide](https://www.prisma.io/docs/orm/more/upgrades/to-v7) if this ever
    needs revisiting. Note that `prisma7.config.ts`'s `datasource.url` has no
    `directUrl` field in 7.10.0 — it's set to `DIRECT_URL` and used only by
    the CLI (migrate/introspect/studio); the app itself connects via the
    `@prisma/adapter-pg` adapter using the pooled `DATABASE_URL` (see
    `src/server/db.ts`).
- **shadcn/ui's `cn` helper ships as the standalone `cn` npm package** in
  the current shadcn CLI output (`src/lib/utils.ts` re-exports it) rather
  than a hand-rolled `clsx` + `tailwind-merge` combination. Same behavior,
  one less hand-maintained file.
