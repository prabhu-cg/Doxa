# Architecture

## Product shape

Doxa is a generic community feedback, prioritisation and decision platform.
The core loop is:

**Collect → Discuss → Understand → Prioritise → Decide → Communicate**

The fundamental object is the **Item** — not "feature request." An Item may
represent a feature request, idea, suggestion, issue, requirement,
improvement, question, or an organisation-defined concept. Terminology and
workflow configurability per organisation is a later-phase concern, but the
data model and UI copy must never hard-code "feature request" as the only
shape an Item can take.

Philosophy: **simple by default, powerful when needed.** Default flows stay
uncluttered; configurability is opt-in, not forced on every organisation.

## System style

Doxa is a **modular monolith** — one Next.js application, one Postgres
database, feature modules with clear boundaries inside `src/features/`.
There are no microservices, no separate backend service, and no message
queue in this build. Do not introduce one to solve a problem that a
well-organised monolith already solves.

## Conceptual hierarchy

```
User
  └── Organisation membership (role)
        └── Space
              └── Board
                    └── Item
                          ├── Votes
                          ├── Comments
                          ├── Followers
                          ├── Tags / Categories
                          ├── Status
                          ├── Priority
                          ├── Attachments
                          ├── Activity history
                          └── Decision
```

Every record below Organisation in this tree is tenant-owned: it belongs to
exactly one Organisation, directly or transitively. See
`docs/multi-tenancy.md` for how that ownership is enforced.

## Request flow

- **Server Components** are the default rendering mode and the default way
  to read data — fetch directly, no API layer for internal reads.
- **Server Actions** handle mutations triggered from Doxa's own UI (forms,
  buttons). POST-only, not for external consumption.
- **Route Handlers** (`route.ts`) exist only for things Server Actions
  structurally can't do: webhooks (Resend, Supabase, future integrations),
  and any future public/external API.
- **Middleware** is `proxy.ts` in Next.js 16 (renamed from `middleware.ts`)
  — introduced in Phase 1 to refresh Supabase sessions and gate protected
  routes. Not present yet in Phase 0.

See `docs/multi-tenancy.md`, `docs/security-principles.md` and
`docs/coding-conventions.md` for the rules that govern how these pieces are
implemented.

## What Phase 0 built vs. deferred

Phase 0 establishes tooling, project structure, environment/config
validation, the design token baseline, and the Prisma/Supabase connection
plumbing. It does not implement sign-in, protected routes, organisations,
spaces, boards, or items — those begin at Phase 1. See the root `README.md`
"What was implemented" section for the concrete list.
