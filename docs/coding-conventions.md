# Coding conventions

## TypeScript

- Strict mode is on (`tsconfig.json`) and stays on. No `any` to route
  around a type error — fix the type or narrow it.
- Prefer explicit return types on exported functions in `lib/`, `server/`,
  and feature `actions.ts`/`queries.ts` files. Inference is fine for local
  variables and Server/Client Component return types (JSX).
- Validate everything crossing a trust boundary with Zod: form input,
  Server Action arguments, Route Handler request bodies, search params.
  Never assume `FormData` or a request body matches the shape you expect.

## Components

- **Server Components by default.** Add `"use client"` only when the
  component needs interactivity, browser APIs, or a React hook that
  requires the client (state, effects, event handlers).
- **No business logic in components.** A component receives data and
  callbacks as props, or fetches via a `queries.ts` function; it does not
  contain authorization checks, tenant-scoping logic, or direct database
  calls inline. That logic lives in `features/<name>/queries.ts` or
  `actions.ts`.
- Presentation primitives (`components/ui/`) take data-agnostic props
  (`label`, `variant`, `children`) — never a domain type like `Item` or
  `Organisation`.

## Server Actions vs. Route Handlers vs. Server Components

Follow this decision order:

1. Reading data for Doxa's own UI → fetch directly in a Server Component.
2. Mutating data from Doxa's own UI → Server Action.
3. Webhook, external API consumer, or anything needing HTTP semantics
   (custom status codes, streaming, non-Doxa clients) → Route Handler.

Don't reach for a Route Handler to serve Doxa's own pages "just in case" —
that reintroduces a client/server round trip Server Components exist to
avoid.

## Naming

- Files: `kebab-case.ts` / `kebab-case.tsx`, except Next.js special files
  (`page.tsx`, `layout.tsx`, `route.ts`, ...) which keep their required
  names.
- React components: `PascalCase` export names, matching the primary export
  of the file.
- Server Actions and query functions: verbs — `createItem`, `getItemById`,
  `listBoardsForSpace` — not nouns.

## Formatting & linting

- `pnpm format` (Prettier, with `prettier-plugin-tailwindcss` for class
  ordering) and `pnpm lint` (ESLint, `eslint-config-next`) both run clean
  before any commit. Neither is optional.
- Don't hand-sort Tailwind classes — let the Prettier plugin do it, so
  diffs stay about behavior, not whitespace.

## Comments

Default to none. Add a comment only when the _why_ isn't obvious from the
code — a non-obvious constraint, a workaround, an invariant a future editor
could easily break. Don't restate what the code already says.
