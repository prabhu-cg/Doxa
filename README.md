# Doxa

A generic community feedback, prioritisation and decision platform:
**Collect → Discuss → Understand → Prioritise → Decide → Communicate.**

This repository is being built in sequential, phase-gated prompts.
**Phase 0 (foundation), Phase 1 (auth & tenancy), Phase 0.5 (marketing
site), Phase 2 (Spaces/Boards/Items), Phase 3 (community interaction:
voting, comments, followers, mentions, activity, notifications, search,
moderation), Phase 4 (priority, scoring, decisions, decision history,
roadmap, admin prioritisation), and Phase 5 (plans, entitlements, billing
architecture, organisation admin, audit log, usage enforcement, basic
branding) are complete.** AI and third-party integrations are not yet
built.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui ·
Supabase (Postgres, Auth, Storage) · Prisma 7 · Zod · React Hook Form ·
Tiptap · Resend · Stripe · Vitest · Playwright · pnpm. See
`docs/tech-stack.md` for exact pins and why.

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

## What was implemented (Phase 5 — SaaS plans, entitlements, billing, admin, audit log)

This phase's objective: prepare Doxa to operate as a commercial
multi-tenant SaaS while retaining a useful free tier.

- **Plans**: a global `Plan` table (`prisma/schema.prisma`) — exactly
  three rows, one per `PlanKey` (FREE/PRO/BUSINESS), seeded by the Phase
  5 migration's backfill and re-appliable via `pnpm db:seed-plans`
  (`prisma/seed-plans.ts`, upserts from `features/billing/defaults.ts`).
  Every numeric limit and boolean feature flag lives on this row —
  `null` means unlimited. **No billing logic is hard-coded anywhere in
  application code**; every check goes through
  `features/entitlements/queries.ts`.
- **Entitlements**: `features/entitlements/queries.ts` is the single
  central system controlling max organisations (per owning user, capped
  by FREE's limit — see "Assumptions made" below), max members, max
  boards, max Items, storage (modeled, not yet enforced — no file
  storage feature exists), advanced prioritisation, analytics (modeled,
  not yet enforced), branding, API access (modeled, not yet enforced),
  and integrations (modeled, not yet enforced). Usage is always computed
  live (`getUsageForOrganization`) — never denormalized, so it can never
  drift, and archived (not just active) Boards/Items still count against
  a limit, since archiving is a visibility change, not deletion, and
  must never be a loophole for unlimited resource cycling.
  `createOrganization`/`completeOnboarding`, `createBoard`, and
  `createItem` all enforce their respective limit **server-side** before
  writing — never a client-side check.
- **Billing architecture**: `features/billing/` implements the
  Customer/Subscription/Plan/SubscriptionStatus/BillingPeriod/
  cancellation architecture the brief asked for, modeled directly on
  Stripe's own objects so a webhook has a natural, already-correct shape
  to write into. Every organisation gets a `Customer` + `Subscription`
  (on FREE) the moment it's created — billing being unconfigured must
  never mean an organisation lacks a plan. `features/billing/stripe.ts`
  returns `null` when `STRIPE_SECRET_KEY` is unset (every local dev
  environment, per `docs/environment.md`); `changePlan` and
  `cancelSubscription` (`features/billing/actions.ts`) both work
  correctly either way — with Stripe configured, upgrading a paid plan
  redirects to a real Stripe Checkout Session and the actual plan change
  applies from the webhook
  (`src/app/api/webhooks/stripe/route.ts`, verifies the signature,
  501s if billing isn't configured, handles
  `checkout.session.completed`/`customer.subscription.updated`/
  `customer.subscription.deleted`); without Stripe, a plan change (or a
  FREE downgrade, always) writes directly to the local `Subscription`
  row, so every plan transition is testable without a Stripe account.
  Stripe secret keys never leave `src/server`/`server-only`-guarded code
  (`src/lib/env/server.ts`).
- **Organisation admin**: `/org/[slug]/settings/{billing,branding,
audit-log}` are new; item type/status/category/tag/priority/scoring
  management (Phases 2 and 4) and member management (Phase 1/3) were
  already in place and are unchanged. **Roles** gained a real
  promote/demote flow — `changeMemberRole`
  (`features/organizations/actions.ts`, `canChangeMemberRole`
  permission) lets an admin move a member between MEMBER/ADMIN and an
  owner additionally promote to/demote from OWNER (never the last one),
  surfaced as a role `<Select>` next to each member on the settings
  page.
- **Branding**: `Organization.logoUrl`/`accentColor` (gated behind the
  `branding` entitlement when actually setting a non-default value —
  clearing is always allowed, so a downgraded organisation never loses
  what it already had) plus organisation-configurable Item terminology
  (`itemTerminologySingular`/`Plural`, ungated — it's organisational
  configuration, not visual branding) at
  `/org/[slug]/settings/branding`. Terminology is applied in the
  highest-traffic item-related copy (the "New Item" button and page,
  `features/organizations/terminology.ts`), not swept across every
  string. The public board page shows the organisation's logo (if set)
  and applies its accent colour to the board title — "public board
  identity" without a website builder.
- **Audit log**: `AuditLog` (`prisma/schema.prisma`) — organisation-
  scoped, append-only, written via `features/audit-log/log.ts#
logAuditEvent` inside the same transaction as the mutation it records
  (same pattern as `ItemActivity`/`Decision`). Logged: member removed,
  role changed, organisation/branding updated, board created/archived/
  restored, decision recorded, and plan changed (including a
  Stripe-webhook-originated change, with a null actor). `data` never
  carries a secret or token — see `docs/security-principles.md`'s
  "Auditability" section, which named this phase explicitly. Visible at
  `/org/[slug]/settings/audit-log`, admin+-only.
- **UX**: the cross-board admin prioritisation view (Phase 4) is now
  gated behind the `advancedPrioritisation` entitlement — an
  unentitled organisation sees a plain upgrade message instead of the
  feature, never a 404 (this is an entitlement gap, not an authorization
  failure). No scoring/branding/billing UI looks like "enterprise
  software" by default: a Free-tier organisation using only Status and
  votes never sees a paywall unless it actually tries a gated action.
- **Testing**: `features/{entitlements,billing,audit-log}/
*.integration.test.ts` cover limit enforcement (including the
  archived-doesn't-free-quota guarantee), null-limit (unlimited) plans,
  plan-seeding correctness against `DEFAULT_PLANS`, audit log tenant
  isolation and append-only ordering, and the new
  `canChangeMemberRole` permission matrix (added to
  `organizations.integration.test.ts`) — real Prisma queries against the
  real Supabase instance, same pattern as every prior phase.
  `e2e/billing.spec.ts` exercises the actual Server Action + UI paths
  end to end: a new org starts on Free with Free's limits shown, an
  admin (not the owner) can't touch billing, branding/advanced
  prioritisation are paywalled on Free and unlocked immediately after an
  owner switches to Pro (with no Stripe configured), both changes land
  in the audit log, and cancelling flips the plan back to Free.
  `e2e/utils/test-users.ts#createTestOrganizationForUser` was updated to
  create a Customer+Subscription(FREE) row exactly like the real
  `createOrganization` Server Action does, since every action that
  resolves an organisation's plan now requires one.

## What was implemented (Phase 4 — priority, scoring, decisions, roadmap)

This phase's core differentiation: **opinions are evidence, not
automatically decisions.**

- **Data model**: four new tables
  (`prisma/migrations/20260915193907_phase4_*`):
  - `Priority` — organisation-controlled data, the exact same "data, not
    code" pattern as `ItemType`/`Status` (see "Item Types" in
    `docs/architecture.md`), seeded with None/Low/Medium/High/Critical
    (`features/priorities/defaults.ts`), "None" marked `isDefault`.
    `Item.priorityId` is required, defaulting a new Item to the org's
    default priority exactly the way `statusId` already does. The
    migration backfills all five default priorities onto every
    pre-existing organisation and assigns every pre-existing Item to
    "None" before the column is made `NOT NULL`.
  - `ScoreCriterion` / `ItemScore` — a flexible, organisation-configured
    prioritisation model. Criteria (Customer impact, Business value,
    Strategic alignment, Effort, Urgency, Confidence, or anything else an
    org defines) are per-organisation rows an org opts into by creating
    them — zero seeded by default, so no organisation is forced to use
    any dimension. `ItemScore` is a sparse `(itemId, criterionId)` table
    (`@@unique`, same upsert-a-row shape as `Vote`) holding a 1-5 value;
    an Item is never forced to be scored on every configured criterion.
    The weighted-average score is computed on read
    (`features/scoring/queries.ts#computeItemScore`) across only the
    criteria an Item actually has, never denormalized — same
    never-drifts rationale as vote counts.
  - `Decision` — a first-class, **append-only** record of what was
    decided about an Item and why (`type`, `rationale`, optional
    `targetDate`/`internalNotes`, `createdBy`, `createdAt`). There is
    deliberately no `updateDecision`/`deleteDecision` — recording a new
    Decision never overwrites a previous one; an Item's full decision
    HISTORY is every `Decision` row ordered by `createdAt`, and the
    CURRENT decision is simply the most recent one
    (`features/decisions/queries.ts`). This is what "opinions are
    evidence, not automatically decisions" resolves to structurally:
    votes/comments/scores never write here directly, only an explicit
    `recordDecision` call does.
  - `RoadmapStage` on `Decision` — where (if anywhere) an Item sits on
    the basic Now/Next/Later roadmap, set explicitly per Decision rather
    than inferred from `DecisionType`, so an Item never lands on the
    roadmap just because it got votes.
  - `ActivityType` gained `PRIORITY_CHANGED` and `DECISION_RECORDED`,
    logged the same way `STATUS_CHANGED` already is.
- **Scoring & priority management**: `features/priorities/` and
  `features/scoring/` (each `schema.ts`/`queries.ts`/`actions.ts`/
  `permissions.ts`, following the Phase 2 feature-module shape) plus
  inline create/rename/archive-or-restore managers under
  `/org/[slug]/settings/{priorities,scoring}`. Managing either is
  owner/admin-only; scoring an Item (the business-signal input itself)
  is admin+-only too — deliberately stricter than voting (any member),
  so a vote can never be mistaken for a business-value score.
- **Decisions**: `features/decisions/` — `recordDecision` is create-only
  and admin+-only. The Item page's new "Decision" section shows the
  current decision plus a collapsible full history; the public Item page
  shows the current decision's type and rationale (never
  `internalNotes`, which is admin-only by design) so the "Communicate"
  step of the core loop has something real to show.
- **Item page redesign**: explicitly split into COMMUNITY SIGNAL (votes,
  comments, followers — unchanged from Phase 3, now labeled and
  captioned "not priority") and BUSINESS SIGNAL (the scoring panel,
  admin+-only, hidden entirely for an organisation with zero configured
  criteria) per the brief's "do not imply that vote count equals
  priority." Priority itself is edited alongside item type/status/
  category in the existing edit form (author-or-admin, same gate as
  those fields).
- **Roadmap**: `features/roadmap/` + `/org/[slug]/roadmap` — a basic
  three-column Now/Next/Later view built entirely from Item + Decision
  data (no new roadmap-specific model beyond `RoadmapStage`), visible to
  any org member. An Item appears only once an owner/admin's Decision
  explicitly placed it there.
- **Admin prioritisation**: `features/prioritization/` +
  `/org/[slug]/prioritization` — "what should we consider next?",
  admin+-only, spanning every board in the organisation (not one board at
  a time). Sortable/filterable by votes, priority, status, type,
  category, and score, with votes and score always shown side by side,
  never collapsed into one ranking number.
- **UX**: no scoring UI appears anywhere for an organisation with zero
  configured criteria (progressive disclosure per the brief's "do not
  make the UI look like a complicated enterprise scoring system" — a
  simple org using only Status/votes never sees a scoring control).
- **Testing**: `features/{priorities,scoring,decisions,roadmap,
prioritization}/*.integration.test.ts` cover tenant isolation, the
  weighted-average scoring math (including the zero-weight/unscored-item
  edge cases), the append-only decision-history guarantee (recording a
  second decision never overwrites the first; "current" is always the
  newest), roadmap grouping/sorting/archived-exclusion, and every new
  permission matrix — real Prisma queries against the real Supabase
  instance, same pattern as Phases 1-3. Every existing feature's
  `*.integration.test.ts` fixture that created an `Item` directly was
  updated for the now-required `priorityId`, and
  `e2e/spaces-boards-items.spec.ts`'s default-seeding test now also
  verifies the five default Priorities. `e2e/community.spec.ts` and
  `e2e/spaces-boards-items.spec.ts` cover the real Server Action + UI
  paths through item creation with a default priority.

## What was implemented (Phase 3 — community interaction layer)

The core loop this phase adds: **Submit → Discuss → Vote → Follow.**

- **Data model**: six new tables, each cascading through the Item they
  belong to (`prisma/migrations/20260914200329_phase3_*`):
  - `Vote` — `(itemId, userId)` is `@@unique`. That constraint is what
    actually enforces "one active vote per user per Item" and "prevent
    duplicate votes" under concurrency — two racing inserts both reach
    Postgres, one commits, the other's unique-violation is caught and
    treated as a no-op by `addVote`. Vote counts are computed on read
    (`_count` on the relation), never denormalized onto Item, so they
    can't drift.
  - `Comment` — self-referencing `parentId` gives one level of threaded
    replies (a reply to a reply collapses onto the same top-level
    thread — kept flat on purpose, per the brief's "don't build an
    overly complex discussion system"). Deletion is always soft
    (`deletedAt` + `body` cleared) so a removed comment doesn't leave a
    hole in its thread; it renders as "[deleted]" instead.
  - `CommentMention` — `@mention` parsing happens once, at write time
    (`features/comments/mentions.ts`), only resolving usernames that
    belong to the same organisation; the result is stored as real rows,
    not re-derived from `body` text on every read.
  - `ItemFollower` — same `@@unique` add/remove-a-row shape as Vote. An
    Item's author is auto-followed on creation, and any commenter is
    auto-followed on their first comment, so notifications reach the
    people actually involved without an explicit follow step first.
  - `ItemActivity` — an append-only history entry per meaningful event
    (created, edited, status changed, vote added/removed, comment
    added, archived/restored). Deliberately excludes low-signal UI
    events (opening the item, changing a filter).
  - `Notification` — carries `organizationId` directly for tenant-scoped
    reads, plus enough context (recipient, type, actor, item/comment)
    that an email-delivery job can consume it later without a rework —
    no email sending in this phase, in-app only.
- **Voting**: `features/votes/` — `addVote`/`removeVote` Server Actions,
  gated the same as submitting an Item (any org member). The Item page's
  vote button is optimistic and reconciles from the server response.
- **Comments**: `features/comments/` — create, edit-own, delete
  (self or admin+ moderation), one level of replies. `canEditComment` is
  author-only even for admins — editing someone else's words reads
  differently from removing them, so moderation only ever deletes.
- **Followers**: `features/followers/` — explicit follow/unfollow, plus
  the auto-follow behavior above (`features/followers/ensure.ts`).
- **Mentions**: structural, via `CommentMention` — see the data model
  section above.
- **Activity**: `features/activity/` — `logActivity` is called from
  inside the same transaction as the mutation it records (item create,
  item update, archive/restore, vote, comment) so an activity entry
  can never exist without — or separately from — the write it describes.
- **Notifications**: `features/notifications/` — `notifyCommentAdded`
  (a reply's parent-comment author gets the more specific
  `COMMENT_REPLY`; every other follower gets `ITEM_COMMENT`; nobody gets
  both for the same comment), `notifyMentions` (`MENTION`), and
  `notifyStatusChanged` (`ITEM_STATUS_CHANGED`, to followers other than
  whoever changed it). A bell in the app header (`AppShell` →
  `NotificationBell`) shows an unread count and a dropdown list; opening
  one marks it read.
- **Search & filtering**: `boardFiltersSchema` (`features/items/schema.ts`)
  gained `tag` and `sort` (`newest` / `most-voted` / `recently-updated`);
  `listItemsForBoard` filters by tag slug and orders by the chosen sort
  (`most-voted` uses `orderBy: { votes: { _count: "desc" } }`, not a
  denormalized counter). Both the admin and public board pages, and
  `ItemCard`, surface vote/comment counts.
- **Moderation**: admins+ can delete any comment (see Comments above),
  archive Items (already existed from Phase 2 — `canArchiveItem` already
  allowed admin+), and now remove a member from the organisation entirely
  (`features/organizations/actions.ts#removeMember`,
  `canRemoveMember` — an admin can't remove an owner; an owner can't
  remove the last owner; nobody removes themselves this way, that's
  "Leave organisation").
- **The Item page** (`/org/[slug]/boards/[boardSlug]/items/[itemSlug]`)
  is the redesigned surface for all of the above: title, description,
  type, status, and tags stay in the same compact header block as
  Phase 2; votes and following sit in one row right below it; comments
  and activity are split into two tabs (`Discussion` / `Activity`) so
  neither crowds the page by default. The public, unauthenticated Item
  page (`/b/[orgSlug]/[boardSlug]/[itemSlug]`) gained read-only
  vote/comment/follower counts, not interactive controls — see
  "Assumptions made" below.
- **Tests**: `features/{votes,comments,followers,activity,
notifications}/*.integration.test.ts` (added to the existing
  `items.integration.test.ts` and `organizations.integration.test.ts`
  suites where the fixtures already existed) cover the concurrent-vote
  race, mention resolution and its org-scoping, notification dedup logic,
  tenant-scoped notification reads, and the new permission matrices —
  real Prisma queries against the real Supabase instance, same pattern as
  Phase 2. `e2e/community.spec.ts` covers the actual Server Action + UI
  wiring end to end: submit → vote → follow → comment-with-mention →
  activity → notification, comment moderation, tenant isolation on the
  Item page, and search/filter/sort on the board page.

## What was implemented (Phase 2 — Spaces, Boards, Items)

- **Data model**: `Space` → `Board` → `Item`, plus `ItemType`, `Status`,
  `Category`, and `Tag` as per-organisation data tables — never a
  hard-coded "Feature Request" enum (`prisma/schema.prisma`). `ItemType`
  and `Status` are soft-archived (`archivedAt`) so historical Items keep
  their meaning even after an org retires a type/status; `Category`/`Tag`
  are lightweight hard-delete labels (`Item.categoryId` goes `null` on
  delete, `ItemTag` join rows cascade). `Board` carries an explicit
  `status` enum (`ACTIVE`/`ARCHIVED`, matching the brief's own wording)
  separately from `visibility` (`PUBLIC`/`PRIVATE`). `Item` has both
  `archivedAt` (author/admin can restore) and a reserved-but-unused
  `deletedAt` (future moderation hook) per the brief's "archived/deleted
  state" field.
- **Default seeding**: creating an organisation (`createOrganization` /
  `completeOnboarding` in `src/features/organizations/actions.ts`) now
  also seeds the six default Item Types (Feature/Idea/Bug/Improvement/
  Suggestion/Requirement, `src/features/item-types/defaults.ts`) and six
  default Statuses (Open/Under Review/Planned/In Progress/Completed/
  Declined, `src/features/statuses/defaults.ts`, "Open" marked as the
  default new-Item status) in the same `create` call — no separate
  migration/backfill step, and organisations can rename/reorder/archive
  every one of them afterwards.
- **Feature modules**: `src/features/{spaces,boards,item-types,statuses,
categories,tags,items}/` each follow the Phase 1 shape
  (`schema.ts`/`queries.ts`/`actions.ts`/`permissions.ts`, plus `slug.ts`
  where slugs are generated). A shared `src/lib/slug.ts`
  (`slugify`/`generateUniqueSlug`) replaces the Phase 1 one-off in
  `features/organizations/slug.ts`, which now calls it too. Every Server
  Action re-derives the organisation from a slug via
  `requireOrganizationMembership`/`requireBoardForOrgMember` and
  re-verifies any client-supplied id (space/item-type/status/category)
  actually belongs to that organisation before using it — never trusting a
  `<select>` value at face value. See `docs/multi-tenancy.md`.
- **Permissions**: space/board/item-type/status/category/tag management is
  owner/admin-only (`hasAtLeastRole(role, "ADMIN")`, reusing Phase 1's
  capability-matrix pattern); any member can submit an Item to a board
  they can see; editing/archiving an Item is allowed for its author or an
  admin+ (`src/features/items/permissions.ts`).
- **Public experience**: `/b/[orgSlug]/[boardSlug]` and
  `/b/[orgSlug]/[boardSlug]/[itemSlug]` are new top-level routes,
  deliberately outside `/org` so `src/lib/supabase/middleware.ts`'s
  protected-prefix allowlist doesn't need to change. `getVisibleBoard`/
  `getVisibleItem` (`src/features/boards/queries.ts`,
  `src/features/items/queries.ts`) return the same `null` for "doesn't
  exist," "archived," and "PRIVATE and you're not an authorised member" —
  the public-route version of the Phase 1 IDOR-hardening pattern. Search
  and item type/status/category filters are a plain `GET` `<form>`
  (`src/components/item-filters.tsx`) — no client JS required to browse or
  filter a board.
- **Admin experience**: `/org/[slug]/spaces`, `/org/[slug]/boards`
  (list/create/settings/archive-restore for both), `/org/[slug]/boards/
[boardSlug]/items` (list with the same filters, create, edit, archive/
  restore), and `/org/[slug]/settings/{item-types,statuses,categories,
tags}` (inline create/rename/archive-or-delete list managers, linked
  from the existing org settings page).
- **Testing**: `src/features/items/items.integration.test.ts` (tenant
  isolation for the Space/Board/Item hierarchy — cross-org board/item
  access, archived/deleted exclusion, search filtering — against the real
  Supabase Postgres instance, same pattern as Phase 1's
  `organizations.integration.test.ts`) and `src/lib/slug.test.ts` (pure
  unit tests for the shared slug helper). `e2e/spaces-boards-items.spec.ts`
  covers the admin golden path (space → public board → item, verified
  visible on the public route unauthenticated), default item-type/status
  seeding via the real onboarding flow, and the security scenarios from
  the brief: an anonymous or non-member visitor 404s on a PRIVATE board,
  an archived PUBLIC board 404s, a non-member 404s on the admin board
  route, and a board slug guessed against the wrong organisation 404s.
- **Fixed along the way (pre-existing, not Phase 2 code)**: the Phase
  0.5 `PasswordInput` component's show/hide toggle button has an
  `aria-label` containing the substring "password" ("Show password"),
  which broke every e2e test's `getByLabel("Password")` login helper via
  Playwright's substring matching — fixed by matching `{ exact: true }` in
  `e2e/auth.spec.ts`, `e2e/organizations.spec.ts`, and the new spec.
  Base UI's `<Select.Value>` doesn't resolve a value to its item's label
  text until the popup has been opened at least once (it shows the raw
  value beforehand) — every `<Select>` usage now passes an `items` map so
  the trigger always shows the right label immediately.

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

- **"Maximum organisations" is checked per owning user against FREE's
  limit, at the moment they try to create a new one, regardless of what
  plan their existing organisations are on** — the brief lists "maximum
  organisations" as an entitlement without saying which plan's limit
  governs creating an ADDITIONAL one; since a brand-new organisation
  always starts on FREE (there's no flow to pre-select a paid plan
  before creation — Stripe checkout only exists for an org that already
  exists), the only coherent cap to check at creation time is FREE's.
  This is a real limitation: a Business-plan owner who wants a sixth
  organisation must create it, then immediately upgrade it, rather than
  it being pre-approved by their existing plan.
- **Only the organisation OWNER can manage billing** (`canManageBilling`,
  `features/billing/permissions.ts`), not admins — the brief doesn't
  specify who controls money; treating it as an owner-only action, one
  tier stricter than the existing admin+ tier used for statuses/
  priorities/scoring/branding, matches how real billing systems gate
  payment changes and avoids an admin (who can't remove an owner or see
  the audit log's full picture) being able to downgrade or cancel a
  plan.
- **Archived Boards/Items still count against their plan's limit** —
  the brief doesn't say whether archiving frees up quota; since
  archiving is explicitly a visibility change, not a deletion
  (`Board.status`/`Item.archivedAt` are both fully restorable), letting
  it free up quota would make limits meaningless (archive-and-recreate
  in a loop). `maxOrganizations`/`maxMembers` have no equivalent
  "archive" state to worry about.
- **Without Stripe configured, a plan change writes directly to the
  local `Subscription` row** (`features/billing/actions.ts#changePlan`)
  — the brief says Stripe must never be required for local development
  but also asks for real Customer/Subscription/cancellation architecture;
  reconciling those means the direct-write path exists for every
  environment without `STRIPE_SECRET_KEY` set, which in practice is only
  ever local dev/test, since a real production deployment configures it.
  This is documented, not hidden — see `features/billing/actions.ts`'s
  doc comment.
- **Logo/accent colour are gated behind the `branding` entitlement only
  when being SET to a non-default value; clearing them back to nothing
  is always allowed** — this asymmetry is deliberate: a downgraded
  organisation keeps seeing its existing branding (the schema comment in
  `prisma/schema.prisma` says the column always accepts a value so
  downgrading doesn't lose data) but can still remove it if it wants to,
  since removal never needs the entitlement it no longer has.
- **Item terminology (`itemTerminologySingular`/`Plural`) is NOT gated
  behind the `branding` entitlement, unlike logo/accent colour** — the
  brief's ENTITLEMENTS list has a `branding` bullet, but its
  ORGANISATION ADMIN list separately names "default terminology" as its
  own bullet; read as two different capabilities, terminology is
  organisational configuration (like renaming a Status), not visual
  branding, so it's free on every plan.
- **Scoring an Item (the business signal itself) is admin+-only, not
  open to any member** — the brief distinguishes COMMUNITY SIGNAL from
  BUSINESS SIGNAL but doesn't say who may set the latter; since scoring
  represents the organisation's own evaluation (impact, effort, strategic
  alignment), not community input, it's gated the same as recording a
  Decision rather than the same as voting.
- **Recording a Decision is admin+-only** — "a Decision belongs to an
  Item" doesn't say who may record one; since a Decision represents an
  organisational commitment ("what was decided and why"), not a
  member's individual view, it's treated as a moderation-tier action, the
  same tier as managing statuses/priorities/item types.
- **The public Item page shows the current Decision's type and
  rationale, never `internalNotes`** — the brief's own example rationale
  ("Declined because...") reads as something meant to be communicated
  back to whoever asked, matching the loop's explicit "Communicate" step
  in `docs/architecture.md`; `internalNotes` is named "internal" in the
  brief itself, so it stays admin-only.
- **Priority is edited via the existing item edit form (author-or-admin),
  not gated separately from item type/status/category** — the brief says
  "Priority must be organisation-controlled" (i.e. the available levels
  are org-configured data, not who may set them on an Item), so it
  follows the same permission as the fields it sits next to in that form.
- **Roadmap view is visible to any org member; the admin prioritisation
  view is admin+-only** — the brief separates "ROADMAP" (a basic view
  Items can "appear in") from "ADMIN PRIORITISATION" (explicitly named
  for a "product/admin user" asking "what should we consider next?"),
  read as different audiences: the roadmap communicates outward, the
  prioritisation view is the internal working tool.
- **Roadmap stages are a fixed Now/Next/Later enum, not organisation-
  configurable** — the brief gives "Now/Next/Later" as "initial roadmap
  states," but unlike Status/Priority/ItemType (explicitly called out as
  configurable data), making these configurable too wasn't asked for and
  would add a fifth org-configurable-list settings page for a "basic"
  view the brief explicitly says shouldn't become "a complex
  project-management system."
- **No email/in-app notification when a Decision is recorded** — Phase 3's
  `Notification` model could carry a `DECISION_RECORDED` type later
  (same deferral pattern as `notifyStatusChanged`), but this phase's
  brief doesn't ask for it, and followers already see it in the Item's
  Activity tab.
- **Item description is plain text, not Tiptap rich text** — Tiptap is
  installed (`docs/tech-stack.md`) and `docs/security-principles.md` names
  Items as where it would first appear, but the Phase 2 brief's own Item
  field list just says "description," and a WYSIWYG editor plus its
  sanitization-library choice is real added scope. Deferred to whichever
  phase actually needs rich formatting (comments are the more likely
  first real use case); `Item.description` is a plain `String?` today.
- **No per-board restriction on which Item Types/Statuses/Categories
  apply** — every active one in the organisation is available on every
  board, matching "simple by default" in `docs/architecture.md`. `Board`
  does carry a reserved `settings Json` column for this kind of
  per-board configuration later (see the Phase 2 section above).
- **Item creation requires an authenticated org member, even on a PUBLIC
  board** — the brief's Public Experience section only asks for
  view/browse/search/open without an account; ITEM CRUD's "users with
  permission can create" reads as membership-gated. Anonymous public
  submission (if wanted later) is a distinct, larger decision (spam/rate
  limiting) left to a future phase.
- **Category is single-select per Item, Tags are multi-select** — the
  brief's CATEGORIES AND TAGS section only says Items "can have multiple
  tags," implying (by omission) a single category, which also matches how
  most feedback tools use "category" vs. "tag."
- **Two pre-existing e2e failures found, not fixed** (both predate this
  phase and are unrelated to Spaces/Boards/Items): `e2e/auth.spec.ts`'s
  "shows a check-your-email message" test, and `e2e/marketing.spec.ts`'s
  "header nav links go to the right pages" test. Neither touches code this
  phase changed (signup confirmation flow; marketing header nav) — the
  first looks like a Supabase project setting (email confirmation
  on/off), the second like a flake introduced by the prior "Brand
  identity, marketing site redesign" commit. Worth a look, but fixing them
  isn't a Spaces/Boards/Items change.
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
- **Voting, commenting, and following require an authenticated org
  member, even on a PUBLIC board** — same reasoning as Phase 2's item
  creation. The public `/b/[orgSlug]/[boardSlug]/[itemSlug]` page shows
  read-only vote/comment/follower counts and points visitors at signing
  in; the interactive controls live on the `/org/[slug]/...` Item page.
- **Comment body is plain text, not Tiptap rich text** — the Phase 2
  README already named comments as "the more likely first real use case"
  for rich text once it lands; this phase's own brief just says
  "comments," so `Comment.body` is a plain `String` for now, matching
  `Item.description`'s existing deferral.
- **One level of comment threading, not arbitrary nesting** — the brief
  explicitly says "if the architecture permits it cleanly" and warns
  against an overly complex discussion system. A reply to a reply
  collapses onto the same top-level thread rather than growing a deeper
  tree — see the `Comment.parentId` note in `prisma/schema.prisma`.
- **Comment moderation clears the body, not just hides it** — "manage
  inappropriate content" reads as actually removing the content, not a
  client-side-only hide; `deletedAt` + an emptied `body` accomplishes
  that while keeping the row (and reply structure) intact.
- **Vote/comment/follow counts are computed on read, not denormalized**
  — `_count` on the Prisma relation, so they can never drift out of sync
  with the underlying rows; see the top-of-file note in
  `prisma/schema.prisma`.
- **No email notifications** — the brief says "prepare the architecture
  for email notifications later," not build them. `Notification` carries
  everything an email job would need (recipient, type, actor, item);
  actually sending email (via Resend, already in the stack per
  `docs/tech-stack.md`) is left to whichever phase asks for it.
- **"Manage users where appropriate" (moderation) implemented as removing
  a member from the organisation** — Phase 1 never built member
  invitation or removal at all (see "Not implemented" below), so this
  phase adds the removal half via `removeMember`/`canRemoveMember`,
  scoped by the same owner/admin rules as everywhere else in
  `features/organizations/permissions.ts`.

## Not implemented (by design)

AI, third-party integrations, and file attachments — see the phased
build plan for what's next. Also out of scope: social login (only
email/password), and member invitations (the only way into an org right
now is creating it — Phase 3 added removing a member, Phase 5 added
changing a member's role, neither added inviting one by email).

**Phase 5 specifically did not implement** (explicitly out of scope per
its own brief): advanced AI. Also not built: enforcement of the
`analytics`/`apiAccess`/`integrations`/`maxStorageMb` entitlements — all
four are modeled on `Plan` (so the system is "capable of controlling"
them, per the brief) but nothing enforces them yet, because the
underlying features (an analytics dashboard, a public API, third-party
integrations, file storage/Attachments) don't exist yet; a member
invitation flow (see "Not implemented" above — `maxMembers` therefore
has no live code path that can actually be blocked by it yet, beyond the
moment of organisation creation, which always starts at one member); a
UI for editing `Plan` rows (`pnpm db:seed-plans` from
`features/billing/defaults.ts` is the configuration mechanism); Stripe
customer-portal / invoice history UI; and proration on a plan change
(the direct-DB-write path applies immediately, and the Checkout path
defers entirely to Stripe's own proration behaviour).

**Phase 4 specifically did not implement** (explicitly out of scope per
its own brief): AI or billing. Also not built: email/notification
delivery for a recorded Decision (Phase 3's `Notification` model could
carry this later, same deferral pattern as `notifyStatusChanged`), a
configurable per-organisation roadmap stage list (Now/Next/Later is
fixed, matching "do not build a complex project-management system"), and
per-board or per-item-type restriction on which scoring criteria apply
(every active criterion is available on every Item, same "simple by
default" reasoning as Phase 2's item types/statuses).

**Phase 2 specifically did not implement** (explicitly out of scope per
its own brief): voting, comments, notifications, roadmap, or AI on top of
the new Item model. Also not built: rich text (see "Assumptions made"
above), per-board Item Type/Status restriction, anonymous public Item
submission, file attachments (named as a Phase 2+ concern in
`docs/security-principles.md`, not requested in this phase's brief), and
moving a Board between Spaces after creation.

**Phase 3 specifically did not implement** (explicitly out of scope per
its own brief): advanced prioritisation, AI, billing, or integrations.
Also not built: email delivery for notifications (see "Assumptions made"
above), arbitrary-depth comment threading, anonymous/public voting or
commenting, rate limiting on votes/comments (same deferral as Phase 2 —
still just a principle in `docs/security-principles.md`), and member
invitations (this phase can remove a member, not add one by email).

**Phase 0.5 specifically did not implement**: real pricing (Stripe or
otherwise — placeholder plan copy only), a documentation/help site,
customer stories or case studies (would require real customers), any AI
capability, an API or webhooks, a wired-up analytics provider (PostHog or
otherwise), or a favicon/OG image asset. See "What was implemented (Phase
0.5)" above for what the pricing architecture, contact form, and
analytics abstraction leave ready for those to plug into later.
