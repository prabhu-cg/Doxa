# Feature modules

Each domain concern gets its own folder here, e.g. `features/organisations/`,
`features/items/`, `features/voting/`. A feature folder owns everything
specific to that domain:

```
features/<name>/
  actions.ts       # Server Actions (mutations)
  queries.ts       # Server-side data-fetching functions
  schema.ts        # Zod schemas for this feature's inputs
  components/      # Feature-specific UI (client or server components)
  types.ts         # Types local to this feature
```

Rules:

- Business logic lives in `actions.ts` / `queries.ts`, never inside a
  component. Components render; they don't decide.
- Every query and action that touches tenant-owned data re-derives the
  authenticated user and re-verifies organisation membership server-side —
  see `docs/multi-tenancy.md`. Never trust an `organizationId` passed in
  from the client as authorization.
- Cross-feature reuse goes through `src/lib/` (generic helpers) or
  `src/components/ui/` (presentation primitives), not by importing one
  feature's internals from another.

No feature modules exist yet — the first lands in Phase 1 (`organisations`,
`memberships`).
