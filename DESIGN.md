---
name: Doxa
description: Listen. Understand. Decide. A warm cream-and-terracotta feedback platform whose public boards are led by the organisation's own identity.
colors:
  primary: "#c74504"
  primary-deep: "#a93a03"
  primary-soft: "#fdefe7"
  primary-foreground: "#ffffff"
  background: "#ffffff"
  surface-cream: "#fffaef"
  surface-muted: "#f4f2ea"
  ink: "#1c1917"
  ink-muted: "#78716c"
  hairline: "#e8ddc8"
  hairline-strong: "#d6c7ab"
  success: "#146c43"
  success-soft: "#e6f4ec"
  warning: "#8a5a00"
  warning-soft: "#fdf3e0"
  info: "#1f5f9e"
  info-soft: "#ebf3fb"
  destructive: "#b3261e"
  destructive-soft: "#fdeceb"
typography:
  headline:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: "normal"
  body-reading:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  caption:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "normal"
  vote-count:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
rounded:
  sm: "3.6px"
  md: "4.8px"
  lg: "6px"
  xl: "8.4px"
  card: "16px"
  badge: "15.6px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  page-gutter: "32px"
  masthead-y: "32px"
  container-max: "1400px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 16px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-muted}"
  input-control:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 10px"
  vote-chip:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    typography: "{typography.vote-count}"
    rounded: "{rounded.lg}"
    width: "44px"
    height: "48px"
  vote-chip-hover:
    textColor: "{colors.primary-deep}"
  vote-chip-voted:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  vote-chip-closed:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink-muted}"
  badge-soft:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    height: "20px"
    padding: "2px 8px"
  badge-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    height: "20px"
    padding: "2px 8px"
  masthead:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
    padding: "32px 32px"
  grid-header-cell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    padding: "10px 12px"
  grid-row-selected:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
    padding: "12px"
  nav-tab-current:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-deep}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  org-monogram:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    size: "48px"
---

# Design System: Doxa

## Overview

**Creative North Star: "The Working Ledger"**

Doxa's world is warm paper and one burnt-orange voice: white working surfaces, cream chrome, hairline borders the colour of old parchment, Manrope throughout, and a single terracotta accent (`primary`, #c74504) that means "act here" or "this is yours". The public board surface extends that world rather than replacing it: it is organisation-led, so the accent, the mark and the name belong to whichever organisation owns the page, while Doxa's typography, spacing and component language stay constant and Doxa's own mark is reduced to one small footer line.

The mode is Operate. Visitors scan, vote and read the team's answer, so the surface is a dense, full-width ledger (a real table) rather than a feed of boxed cards. Depth is tonal and hairline: flat surfaces, 1px warm borders, a tinted masthead, and a drawer that slides over the list. Nothing decorates; every colour, weight and size is carrying state or hierarchy.

The system has two layers. The incumbent Doxa tokens live in `src/app/globals.css` and the shadcn/base-ui components in `src/components/ui`. On `/b/[orgSlug]` and `/r/[orgSlug]` a `BrandStyle` element re-points the accent tokens at the organisation's colour at runtime, after correcting it for contrast (see Colors). Terracotta is what you see when nothing is configured, and that unbranded page is a designed state, not a fallback.

**Key Characteristics:**

- One accent, organisation-owned on public pages, terracotta by default.
- Warm neutrals: cream (#fffaef) chrome, white grid, hairline (#e8ddc8) rules.
- Manrope only; a fixed small type scale; tabular numerals wherever a number is compared.
- Flat depth; shadows exist only for the drawer and roadmap cards.
- The team's decision is first-class content, sitting beside status in the grid.

## Colors

A cream-and-white ledger with a single burnt-orange accent that any organisation may replace.

### Primary

- **Doxa Terracotta** (`primary`, #c74504): the accent. Reserved for the primary action, the voted vote chip, the monogram tile, focus ring, caret, the 3px rule atop the top bar, and links via `primary-deep`. White text on it reaches 4.9:1.
- **Terracotta Deep** (`primary-deep`, #a93a03): the one value behind three roles: hover of the primary fill, accent used as text (`--primary-text`, `--accent-foreground`), and hover text on the vote chip and row title. It is the only accent used for text.
- **Terracotta Tint** (`primary-soft`, #fdefe7): the accent as a ground: the selected row, the current nav tab, soft badges, text selection, the viewer's initial.

### Neutral

- **Paper White** (`background`, #ffffff): the grid, the top bar and every working surface.
- **Cream** (`surface-cream`, #fffaef): chrome that should feel warmer than the grid (sidebar, the item page's vote aside, OG card ground).
- **Oat** (`surface-muted`, #f4f2ea): hover wash for rows and ghost buttons, disabled and closed states, the auth page ground.
- **Warm Ink** (`ink`, #1c1917): all primary text. Secondary copy on the masthead is ink at 75% opacity.
- **Stone** (`ink-muted`, #78716c): column headers, meta text, placeholders' companions.
- **Parchment Hairline** (`hairline`, #e8ddc8): every border, row divider and input outline.
- **Parchment Strong** (`hairline-strong`, #d6c7ab): scrollbar thumb and emphasised dividers.

### Semantic

`success`, `warning`, `info`, `destructive` and their `-soft` grounds are defined for the app; the public grid does not use them (decision and status colours come from data, see Components).

### Named Rules

**The Org-Led Accent Rule.** On public pages never write a terracotta hex or a fixed orange class. Use `primary`, `primary-hover`, `primary-soft` and `primary-text` (or their Tailwind names) so the organisation's accent flows through, including into the portalled drawer. `BrandStyle` writes the variables on `:root` precisely because drawers render outside the page element.

**The Corrected Accent Rule.** `brandTokens()` in `src/lib/brand-color.ts` takes the organisation's hex and darkens it in 6% steps toward black until white text on it reaches 4.5:1 (which also makes it legible as text on white). `primary-soft` is the corrected accent at 10% over white; `primary-text` is darkened further, again in 6% steps, until it reaches 4.5:1 on that tint; `primary-hover` is the corrected accent 16% toward black. `ring`, `accent` and `accent-foreground` follow. Invalid or unset values produce nothing, so terracotta stands. Never render a raw organisation colour as text or as a ground for white text.

**The Tinted Badge Rule.** Any organisation-chosen colour used on a badge (status, decision) goes through `badgeColors()`: the colour at 13% over white as the ground, the colour darkened until it reaches 4.5:1 on that ground as the text. Raw colour on its own tint fails for light hues (amber, grey).

**The One Coloured Answer Rule.** A row shows one coloured answer, not the same word twice. When the team's decision label equals the status name, the decision keeps its colour and the status drops to an outline badge.

**The Masthead Tint Rule.** The masthead ground is 5% of the current `primary` over white (`color-mix(in srgb, var(--primary) 5%, white)`), never a fixed cream, so it belongs to whichever organisation owns the page.

## Typography

**Display Font:** Manrope (ui-sans-serif, system-ui fallback)
**Body Font:** Manrope
**Label/Mono Font:** Manrope; Geist Mono is loaded app-wide but is not used on the public surface.

**Character:** Manrope's round, open forms keep the ledger friendly rather than clinical. Hierarchy comes from weight (400, 500, 600, 700) and a handful of fixed sizes, never from size inflation.

### Hierarchy

- **Headline** (700, 28px, 1.25, -0.025em): the board, roadmap and item-page title. One per page.
- **Title** (600, 15px, 1.375): item titles in the grid (two-line clamp); org name in the top bar is 15px 700 tracking-tight.
- **Body** (400, 14px): grid cells, controls, drawer copy. Masthead description is 15px at leading 24px, capped at `max-w-prose`.
- **Reading** (400, 15px, 1.75): the item description in the drawer and item page, capped at `max-w-prose`, whitespace preserved.
- **Caption** (400, 13px): the one-line grid description (capped 70ch), bylines.
- **Label** (600, 12px, sentence case): column headers, badges, meta, timestamps. Section headings inside the drawer are 14px 600, and "Discussion" is 16px 700.

### Named Rules

**The Fixed Scale Rule.** Sizes are 12, 13, 14, 15, 16 and 28px, expressed as Tailwind `text-xs`/`text-sm`/`text-base` plus the arbitrary `text-[13px]`, `text-[15px]`, `text-[28px]` already in use. No fluid `clamp()` type on the public surface; there is no display tier.

**The Tabular Numerals Rule.** Votes, comment counts, totals and "n of m" use `tabular-nums` so columns of digits align and counts do not jitter as they change.

**The Sentence Case Rule.** Column headers and badges are sentence case, not uppercase and not letter-spaced.

## Layout

A single full-width column capped at 1400px, centred, with gutters of 16px (base), 24px (sm) and 32px (lg). The page stacks: a sticky top bar, a masthead (32px vertical padding), then a content band with a 24px top pad and 16px between toolbar and grid, then the footer. Nothing is nested in a card on the board.

The grid is a real `<table>` with `border-separate border-spacing-0`, a screen-reader caption and `scope="col"` headers. Columns, left to right: Votes (72px), Item, Status, Team decision, Type, Tags, Comments, Updated, Submitted by. Progressive disclosure is by breakpoint: below `md` (768px) the header row is visually hidden and status, decision and comment count fold under the title as one badge line; from `md` Status, Team decision, Comments and Updated appear; from `xl` (1280px) Type, Tags and Submitted by appear. Cells are `py-3` with `px-3`; only the vote cell hugs the left edge (`pl-1`). Header cells are sticky beneath the top bar (`--public-topbar`, 59px = 3px accent rule + 56px bar) on a white ground.

The toolbar is one row: search (max-w-xs), native selects for type, status, category, tag, a Clear ghost button when filtered, and Sort pushed right (`ml-auto`). On phones it becomes a two-column grid with search and sort spanning both. Filters live in the URL and apply on change (search after a 300ms pause).

The item drawer is in the address (`?item=<slug>`): right-hand, full width below `sm` (640px), 42rem (`max-w-2xl`) from `sm`. Inside, a fixed header over a scrolling body with 16px padding, sections separated by a top hairline and `pt-6`. The full item page uses a two-column layout (content, then a 22rem sticky aside) from `lg`.

The roadmap uses three stage columns from `sm`, then a divided "Recently shipped" list.

## Elevation & Depth

Flat and tonal. Surfaces separate by 1px hairlines and by ground (white grid, tinted masthead, cream aside), not by shadow. The selected row is a tint, not a lift.

### Shadow Vocabulary

- **Card** (`box-shadow: 0 1px 2px 0 #1010140a, 0 1px 3px 0 #1010140f`): the roadmap's stage cards (`Card`, 16px radius).
- **Drawer** (Tailwind `shadow-lg` over a `bg-black/10` scrim with a light backdrop blur): the sheet only. It is the one element that leaves the page plane.
- `--shadow-raised` is defined in the tokens and unused on the public surface.

### Named Rules

**The Flat At Rest Rule.** Grid rows, toolbar controls, chips and badges carry no shadow. Elevation belongs to the drawer and the roadmap card.

## Shapes

Gently rounded, never sharp, never bubbly, apart from pills. The base radius is 0.375rem (6px): buttons, inputs, selects, the vote chip and the monogram tile all sit at `lg` (6px). Nav tabs are 4.8px (`md`), the title link's focus outline 3.6px (`sm`), empty-state and aside panels 8.4px (`xl`), roadmap cards 16px. Badges are full pills (`rounded-4xl`, about 15.6px on a 20px-high badge). The viewer's initial is a circle. Borders are 1px hairline, dashed only for an empty state.

## Components

### Buttons

- **Shape:** 6px radius, 36px tall (default), 32px (`sm`), 28px (`xs`), 40px (`lg`); 14px medium.
- **Primary:** fill `primary`, white text, hover `primary-hover`; used once per view (Submit in the masthead).
- **Outline / Ghost:** outline is white with a hairline border and an Oat hover; ghost has no border and an Oat hover. Sign-in to vote inside the drawer is outline, small.
- **Focus / Press:** 3px `ring` at 50% plus border-ring; press translates 1px down.

### Inputs / Fields

- **Style:** 36px tall, 6px radius, white ground, hairline border, `text-sm` (16px on touch below `md` for the ui `Input`). The toolbar's native selects and search share the same measure and use a 2px solid `ring` on focus and 60% ink placeholder.
- **Error / Disabled:** destructive border with 20% ring; disabled at 50% opacity.

### Vote Chip (signature)

- **Shape:** 44 by 48px, 6px radius, 1px border, chevron-up over a tabular count (13px bold). It is the first cell of every row and is repeated as a button in the drawer.
- **States:** idle is white with a hairline border and turns to accent border and `primary-text` on hover; voted is a `primary` fill, white text, `aria-pressed=true`; signed-out it is a link to sign in that returns to the board; closed (unconfirmed email, blocked) is Oat, disabled, with the reason as its title. Voting is optimistic and reverts with a toast on failure. Focus is a 2px `ring` with a 1px offset.

### Data Grid Row

- **Style:** hairline bottom border, hover Oat at 60%, whole row clickable except inner links and controls; middle/cmd-click opens a new tab. The title is a real link.
- **Selected:** `aria-current="true"` with a `primary-soft` fill while its drawer is open, so the list keeps your place.

### Badges

- **Style:** 20px pill, 12px medium. Variants: soft (accent tint), outline (hairline border, ink text), secondary (Oat), plus success, warning, info. Status and decision badges take their colour from organisation data and are always passed through `badgeColors()`.
- **Decision:** "Planned", "In progress", "Completed", "Declined", "Deferred", "Duplicate"; shown bare (label only) in the grid and drawer facts, and as "Decision: Label" elsewhere.

### Navigation

- **Top bar:** white, hairline bottom border, sticky. A 3px `primary` rule sits above a 56px bar: org identity left (30px mark), tabs (one per public board, then Roadmap), viewer menu right (sign-in links, or initial plus name plus Sign out). Below `md` the tabs wrap to a second row.
- **Tabs:** 14px semibold, 4.8px radius; current is `primary-soft` fill with `primary-text`; others are Stone with an Oat hover; the current tab is read from the URL so it stays right inside an open drawer.
- **On masthead pages** (`/b/org/board`, `/r/org`) the top bar shows only the org name, because the masthead carries the mark large.

### Masthead

The page's head, at the Masthead Tint. The org mark at 48px sits beside the 28px board title (mark aligned to the title's top), then the description, then one line of live facts (item count, vote count, the team's responsiveness sentence, "See the roadmap" link) with bold tabular numbers. The Submit primary sits at the right, bottom-aligned, wrapping under on narrow screens. The roadmap masthead has the same shape.

### Org Identity and Monogram

The logo (height set by `size`, `max-w-9rem`) when the org has one and it loads; otherwise a monogram tile: up to two initials, bold, white on `primary`, 6px radius, font size 40% of the tile. A failed image falls back to the monogram. A logo wider than 2.2:1 is treated as a wordmark and the name is dropped beside it. The mark is 30px in the top bar, 48px in the masthead.

### Item Drawer

A right-hand sheet with a fixed header over a scrolling body. Header, top to bottom: the title (20px 700, clamped to four lines) with "Open page" and the close button at its top right; the status and, when it differs, the team's decision, then the type and the board name on one line; the byline ("Priya (team) · last week"). A hairline closes the header. Body order: **Details** (14px 600 label, then the description at 16px/28px and its tags); the team's decision as a tinted panel when there is one; the vote and follow actions; a hairline; the discussion. It slides in from the right over 300ms on a keyframe animation (`data-open:animate-in`, the same pattern as dialogs and menus, because the sheet's transition alone never plays for a panel that mounts open) with the scrim fading in; closing slides out first, then removes `?item`, leaving filters, sort and scroll. Comment times are relative ("3 days ago"); decision dates are `formatDate` ("17 Sep 2026", en-GB, UTC).

### Footer

One hairline-topped row, 12px Stone: the org name left, "Powered by [Doxa mark 16px] Doxa" right, linking home. It is the only place Doxa's identity appears on a public page.

## Do's and Don'ts

### Do:

- **Do** take every accent colour on public pages from `primary`, `primary-hover`, `primary-soft` and `primary-text`, and pass any organisation colour through `brandTokens()` or `badgeColors()` before it touches text.
- **Do** keep the vote first in the row and repeat the vote in the drawer; sign-in returns the visitor to where they were.
- **Do** build lists of comparable records as a real table with a caption, `scope="col"` headers and `aria-sort` on sortable headers.
- **Do** disclose columns by breakpoint (`md`, `xl`) and fold the essentials under the title on phones.
- **Do** put new detail views in the `?item=` drawer pattern (2xl width, full width below `sm`) so they are shareable and refresh-safe.
- **Do** use `formatDate` for absolute dates and `formatRelativeTime` for activity; use `tabular-nums` on every count.
- **Do** design the unbranded state (terracotta, monogram tile) as the finished page.

### Don't:

- **Don't** hard-code terracotta or any organisation colour on `/b` and `/r`, and don't set an accent on `:root` from anywhere except `BrandStyle`.
- **Don't** put an organisation's raw colour behind white text or use it as small text without correction.
- **Don't** show the same word twice in two coloured badges on one row.
- **Don't** repeat Doxa's logo or name on the page beyond the single footer line.
- **Don't** format dates with `toLocaleDateString` or any locale- or zone-dependent call; server and browser must agree.
- **Don't** add shadows to grid rows, chips or badges, and don't lift the selected row; tint it.
- **Don't** introduce type sizes outside the fixed scale or fluid type on the public surface.
- **Don't** use a fixed cream in the masthead; it is the accent tint.
