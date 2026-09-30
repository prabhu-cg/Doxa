---
name: Doxa (portable)
description: Warm cream-and-terracotta design language with one burnt-orange accent, Manrope type, hairline borders and flat depth. Covers the marketing site, the authenticated app and the public feedback board. Copy this file into another project as DESIGN.md.
colors:
  primary: "#c74504"
  primary-hover: "#a93a03"
  primary-text: "#a93a03"
  primary-soft: "#fdefe7"
  primary-foreground: "#ffffff"
  background: "#ffffff"
  foreground: "#1c1917"
  surface: "#fffaef"
  surface-raised: "#ffffff"
  muted: "#f4f2ea"
  muted-foreground: "#78716c"
  border: "#e8ddc8"
  border-strong: "#d6c7ab"
  success: "#146c43"
  success-soft: "#e6f4ec"
  warning: "#8a5a00"
  warning-soft: "#fdf3e0"
  info: "#1f5f9e"
  info-soft: "#ebf3fb"
  destructive: "#b3261e"
  destructive-soft: "#fdeceb"
  dark-background: "#12100e"
  dark-foreground: "#faf7f2"
  dark-card: "#1c1916"
  dark-surface: "#181512"
  dark-muted: "#27221e"
  dark-muted-foreground: "#a8a097"
  dark-border: "#302a25"
  dark-border-strong: "#453d35"
  dark-primary-hover: "#dd5211"
  dark-primary-text: "#ff8a5c"
  dark-primary-soft: "#26130a"
  dark-ring: "#ff8a5c"
  dark-success: "#7ee2ab"
  dark-success-soft: "#10281c"
  dark-warning: "#f5c26b"
  dark-warning-soft: "#2b2110"
  dark-info: "#8cc2f5"
  dark-info-soft: "#10202e"
  dark-destructive: "#ff9d95"
  dark-destructive-soft: "#2e1513"
typography:
  display:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "60px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.11
    letterSpacing: "-0.025em"
  page-title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.56
  title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  body-reading:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  caption:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.33
  eyebrow:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.43
    letterSpacing: "0.025em"
    textTransform: "uppercase"
  stat-numeral:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  mono-index:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "3.6px"
  md: "4.8px"
  control: "6px"
  lg: "6px"
  xl: "8.4px"
  2xl: "10.8px"
  card: "16px"
  pill: "15.6px"
  full: "9999px"
spacing:
  base: "4px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  gutter-mobile: "16px"
  gutter-sm: "24px"
  gutter-lg: "32px"
  section-y: "64px"
  section-y-sm: "80px"
  hero-y-lg: "112px"
  container-marketing: "1152px"
  container-app-page: "1152px"
  container-board: "1400px"
  container-prose: "672px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 16px"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
  button-destructive:
    backgroundColor: "{colors.destructive-soft}"
    textColor: "{colors.destructive}"
    rounded: "{rounded.lg}"
    height: "36px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "4px 12px"
  badge-soft:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "20px"
    padding: "2px 8px"
  badge-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "20px"
    padding: "2px 8px"
  marketing-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "24px"
  icon-tile:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    size: "36px"
  entity-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "20px"
  sidebar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    width: "240px"
  sidebar-item-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  cta-banner:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    padding: "80px 24px"
  vote-chip:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.stat-numeral}"
    rounded: "{rounded.lg}"
    width: "44px"
    height: "48px"
  vote-chip-voted:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
---

# Design System: Doxa

Extracted from the Doxa codebase (Next.js, Tailwind CSS v4, shadcn `base-nova` on Base UI, lucide icons). It describes three surfaces that share one token set: the **marketing site**, the **authenticated app** and the **public feedback board**. Drop it into another project as `DESIGN.md` and use the paste-ready token block in [Implementing the tokens](#implementing-the-tokens) to reproduce the look.

## Overview

**Creative North Star: "The Working Ledger"**

Warm paper, one burnt-orange voice. Working surfaces are white, chrome is cream, every border is a parchment-coloured hairline, all type is Manrope, and a single terracotta accent (`primary`, `#c74504`) means "act here" or "this is yours". Nothing decorates: colour, weight and size carry state or hierarchy. Depth is tonal and hairline, not shadow. Motion answers an action and stops.

The three surfaces differ in density, not in language:

| Surface      | Mode          | Density                      | Container                         | Signature                                                                                     |
| ------------ | ------------- | ---------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| Marketing    | Persuade      | Airy: 64–80px section rhythm | 1152px, centred                   | Alternating white / oat bands, icon-tile cards, terracotta CTA banner                         |
| App          | Operate       | Medium: 24px stack rhythm    | 240px cream sidebar + 1152px page | Cream sidebar, bordered cards that lift on hover, right-hand drawers for create/edit/settings |
| Public board | Scan and vote | Dense: table rows            | 1400px, full-width ledger         | Real data table, vote chip, tinted masthead, org-owned accent                                 |

**Key characteristics**

- One accent. Terracotta by default; on public pages it is replaced at runtime by the organisation's own colour, corrected for contrast.
- Warm neutrals in light mode: cream `#fffaef` chrome, oat `#f4f2ea` washes, hairline `#e8ddc8` rules.
- Manrope only. Hierarchy comes from weight (400/500/600/700) and a short size scale, with tight tracking (`-0.025em`) on every heading.
- Flat at rest. Shadows belong to overlays (drawer, menu, dialog), plus one soft card shadow in the app.
- Radius is a single 6px base with a multiplier scale; pills for badges.
- Icons are lucide, 16px inline, 20px inside a 36px tile, stroke defaults.
- Tabular numerals wherever numbers are compared.

## Colors

A cream-and-white ledger with one orange accent. Every colour is a semantic token; nothing in components uses a raw hex.

### Brand and accent

| Token                | Light     | Dark      | Role                                                                                                            |
| -------------------- | --------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `primary`            | `#c74504` | `#c74504` | Fill for the primary button, voted chip, CTA banner, monogram, icon glyphs. White text on it is **4.90:1**.     |
| `primary-hover`      | `#a93a03` | `#dd5211` | Hover of the primary fill.                                                                                      |
| `primary-text`       | `#a93a03` | `#ff8a5c` | The accent when it is _text_: active nav, soft badges, links. **6.38:1** on white, **5.67:1** on its soft tint. |
| `primary-soft`       | `#fdefe7` | `#26130a` | The accent as a ground: selected row, active nav item, soft badge, text selection.                              |
| `primary-foreground` | `#ffffff` | `#ffffff` | Text on `primary`.                                                                                              |
| `ring`               | `#c74504` | `#ff8a5c` | Focus ring colour (used at 50% alpha).                                                                          |

`primary` itself is never used as small text. Use `primary-text`.

### Neutrals

| Token                               | Light     | Dark      | Role                                                                              |
| ----------------------------------- | --------- | --------- | --------------------------------------------------------------------------------- |
| `background`                        | `#ffffff` | `#12100e` | Page, grid, top bars, every working surface.                                      |
| `foreground`                        | `#1c1917` | `#faf7f2` | All primary text (17.5:1 on white, 17.8:1 in dark).                               |
| `card`, `popover`, `surface-raised` | `#ffffff` | `#1c1916` | Cards, menus, dialogs, drawers.                                                   |
| `surface`, `sidebar`                | `#fffaef` | `#181512` | Cream chrome: app sidebar, item-edit rows, aside panels.                          |
| `muted`, `secondary`                | `#f4f2ea` | `#27221e` | Hover washes, disabled, alternating marketing bands, auth form ground, skeletons. |
| `muted-foreground`                  | `#78716c` | `#a8a097` | Secondary text, meta, placeholders, icons.                                        |
| `border`, `input`                   | `#e8ddc8` | `#302a25` | Every border, divider and input outline.                                          |
| `border-strong`                     | `#d6c7ab` | `#453d35` | Scrollbar thumb, drawer header divider, emphasised rules.                         |

### Semantic

Each has a solid (text/icon) and a `-soft` (ground) value. They are used as tinted badges and alerts, never as large fills.

| Token         | Light solid / soft    | Dark solid / soft     |
| ------------- | --------------------- | --------------------- |
| `success`     | `#146c43` / `#e6f4ec` | `#7ee2ab` / `#10281c` |
| `warning`     | `#8a5a00` / `#fdf3e0` | `#f5c26b` / `#2b2110` |
| `info`        | `#1f5f9e` / `#ebf3fb` | `#8cc2f5` / `#10202e` |
| `destructive` | `#b3261e` / `#fdeceb` | `#ff9d95` / `#2e1513` |

### Data colours

- **Charts:** `#c74504`, `#f59e0b`, `#84cc16`, `#06b6d4`, `#8b5cf6` (dark mode lifts the first to `#e2680f`).
- **Decision types** (user-facing status of an item, shown as a tinted badge): Planned `#3b82f6`, In progress `#f59e0b`, Completed `#22c55e`, Declined `#ef4444`, Deferred `#94a3b8`, Duplicate `#a855f7`. Always render these through the tinted-badge rule below, never as a raw fill.

### Named rules

**The One Accent Rule.** Terracotta is the only chromatic brand colour. Do not introduce a second accent; status colours carry meaning, not brand.

**The Accent-As-Text Rule.** `primary` is for fills under white text. When the accent is text, use `primary-text`, which is darker and is the only accent value that passes on both white and the soft tint.

**The Tinted Badge Rule.** Any data-driven colour on a badge (status, decision, priority) is the colour at **13% over the background** as the ground, and the colour **darkened in 6% steps toward black until it reaches 4.5:1** on that ground as the text. A raw colour on its own tint fails for light hues (amber, yellow, grey).

**The Org-Led Accent Rule (public board only).** On public pages the accent belongs to the organisation. Never write a terracotta hex or a fixed orange class there; use `primary`, `primary-hover`, `primary-soft` and `primary-text` so a runtime override flows through, including into portalled drawers. The override is written to `:root`. See [Org-led theming](#org-led-theming).

**The Masthead Tint Rule.** A page's introducing band is `color-mix(in oklab, var(--primary) 5%, var(--background))`: a breath of the accent over the page background, never a fixed cream, so it follows the organisation's accent and holds in dark mode.

### Known gaps

- `muted-foreground` (`#78716c`) on `muted` (`#f4f2ea`) is **4.28:1**, below AA for small text. Fine for 14px+ meta on white (4.80:1) and on cream (4.61:1); avoid 12px meta on oat.
- `border` (`#e8ddc8`) on white is **1.35:1**. It is decorative; input fields rely on the hairline alone, so add a stronger border (`border-strong`) if a WCAG 1.4.11 non-text-contrast pass is required.
- The app's dark-mode org accent and badge colours are covered by unit tests, not yet checked by eye against a real branded organisation.

## Typography

**Family:** Manrope (variable, Latin subset) for everything. Fallback `ui-sans-serif, system-ui, sans-serif`. **Mono:** Geist Mono, used only for the marketing step index numerals. Set `antialiased` on `<html>`.

**Character:** Manrope's round, open forms keep a dense ledger friendly rather than clinical. Hierarchy is weight plus a handful of fixed sizes, not size inflation. Every heading is bold with `letter-spacing: -0.025em` (Tailwind `tracking-tight`).

### Scale

| Role          | Size / line                                               | Weight                  | Tracking                       | Where                                                    |
| ------------- | --------------------------------------------------------- | ----------------------- | ------------------------------ | -------------------------------------------------------- |
| Display       | 36 → 48 → 60px (base / sm / lg), line-height 1 (48/60 up) | 700                     | -0.025em                       | Marketing hero `h1`, `text-balance`                      |
| Section title | 30 → 36px (base / sm)                                     | 700                     | -0.025em                       | Marketing `h2`, CTA, `text-balance`                      |
| Page title    | 24px / 32                                                 | 700                     | -0.025em                       | App `PageHeader` `h1`, legal page title is 30px          |
| Headline      | 28px / 35                                                 | 700                     | -0.025em                       | Public board / roadmap / item title                      |
| Lead          | 18px / 28                                                 | 400, `muted-foreground` | normal                         | Marketing sub-headline, `text-balance`, `max-w-lg`–`2xl` |
| Title         | 16px / 22                                                 | 600                     | normal                         | Card titles, drawer title is 18–20px                     |
| Body          | 14px / 20                                                 | 400 (500 for controls)  | normal                         | App default, table cells, inputs at `md+`                |
| Reading       | 15px / 26–28                                              | 400                     | normal                         | Long descriptions, `max-w-prose`                         |
| Caption       | 13px / 20                                                 | 400                     | normal                         | One-line descriptions, bylines                           |
| Label         | 12px / 16                                                 | 600 (badges 500)        | normal                         | Column headers, badges, timestamps, card meta            |
| Eyebrow       | 14px / 20                                                 | 600                     | +0.025em, uppercase, `primary` | Marketing section eyebrow above a title                  |
| Stat numeral  | 13px                                                      | 700, `tabular-nums`     | normal                         | Vote counts, totals                                      |

Logo wordmark: 16px 700 tracking-tight; optional 11px 500 muted tagline beneath.

### Named rules

**The Fixed Scale Rule.** Sizes are 11, 12, 13, 14, 15, 16, 18, 20, 24, 28, 30, 36, 48, 60px. Fluid `clamp()` type is not used anywhere. Marketing steps display sizes by breakpoint; the app and board do not.

**The Tabular Numerals Rule.** Votes, comment counts, totals and "n of m" use `tabular-nums` so digits align and do not jitter as they change.

**The Sentence Case Rule.** Buttons, column headers, badges and nav are sentence case. The only uppercase is the marketing eyebrow.

**The Balance Rule.** Marketing headings and leads use `text-wrap: balance`. Body paragraphs do not.

## Layout and spacing

**Base unit 4px** (Tailwind's default `--spacing`). Common steps: 4, 8, 12, 16, 20, 24, 32, 40, 64, 80.

### Containers and gutters

| Surface                    | Max width          | Gutters (base / sm / lg)                   |
| -------------------------- | ------------------ | ------------------------------------------ |
| Marketing                  | `max-w-6xl` 1152px | 16 / 24 / 24                               |
| App page (`PageContainer`) | `max-w-6xl` 1152px | 16 / 24 / 32, `py-8`, children `space-y-6` |
| Public board               | 1400px             | 16 / 24 / 32                               |
| Legal / long-form          | `max-w-2xl` 672px  | 16 / 24                                    |
| Auth form                  | `max-w-sm` 384px   | 24                                         |

Inner measures worth reusing: `max-w-2xl` for centred headings, `max-w-lg` for leads, `max-w-prose` for reading text, `max-w-3xl`–`5xl` for centred card grids.

### Marketing rhythm

- Sections are full-bleed bands that **alternate `background` and `secondary` (oat)**, separated by `border-t`. Inside: `max-w-6xl`, `py-16 sm:py-20`, `px-4 sm:px-6`.
- Hero: `py-16 sm:py-20 lg:py-28`, two columns from `lg` with `gap-12 lg:gap-16`, text centred below `lg` and left-aligned above.
- Section heading block, then `mt-10` to the content grid.
- Card grids: `grid-cols-1 gap-4`, then `sm:grid-cols-2`, `lg:grid-cols-3` (or 4).
- Sticky header `h-16`, footer `py-10`.
- The closing CTA is a full-bleed `primary` banner: `py-20 sm:py-28`.

### App rhythm

- Shell is `h-dvh`: a 240px (`w-60`) cream sidebar (hidden below `md`, reopened as a left sheet `w-64`), a 56px (`h-14`) sticky top bar, and a scrolling `main`.
- Page = `PageContainer` → `PageHeader` → content. Actions sit **top right** of the header (below the text on phones) so the primary action is always in the same place.
- Entity grids: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`.
- Divided lists (`ConfigList`): rows `py-3` separated by hairlines, no boxes.

### Public board rhythm

Sticky top bar (3px accent rule + 56px bar), a tinted masthead (`py-8`), a content band (`pt-6`, 16px between toolbar and grid), one hairline footer row. The list is a real `<table>` with `border-separate border-spacing-0`, cells `px-3 py-3`, and columns disclosed by breakpoint (`md`, `xl`). Nothing on the board is nested in a card.

### Breakpoints

Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. `md` is where the app sidebar and marketing nav appear; `lg` is where two-column heroes and the item page's 22rem aside appear.

## Elevation and depth

Flat and tonal. Surfaces separate by 1px hairlines and by ground (white, cream, oat), not by shadow.

| Token                                     | Value                                                 | Used for                                           |
| ----------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| `shadow-card`                             | `0 1px 2px 0 #1010140a, 0 1px 3px 0 #1010140f`        | App entity cards and the `Card` primitive at rest  |
| `shadow-raised`                           | `0 2px 4px -1px #1010140f, 0 8px 24px -6px #1010141f` | App entity card on hover                           |
| `shadow-md` + `ring-1 ring-foreground/10` | Tailwind                                              | Menus, selects, popovers                           |
| `shadow-lg`                               | Tailwind                                              | Sheets/drawers, the marketing hero product preview |
| Dialog                                    | `ring-1 ring-foreground/10`, no shadow                | Dialogs                                            |
| Overlay                                   | `bg-black/10` + `backdrop-blur-xs`                    | Behind sheets and dialogs                          |

Z-order: sticky headers `z-40`; overlays, menus, tooltips `z-50`.

**The Flat At Rest Rule.** Table rows, toolbar controls, chips, badges and divided-list rows carry no shadow. Selected is a tint, not a lift. On the public board, elevation belongs to the drawer alone.

## Shapes

Base radius `--radius: 0.375rem` (6px). Everything derives from it:

| Token            | Value  | Used for                                                   |
| ---------------- | ------ | ---------------------------------------------------------- |
| `sm`             | 3.6px  | Focus outlines on links                                    |
| `md`             | 4.8px  | Tabs, menu items, skeletons                                |
| `control` / `lg` | 6px    | Buttons, inputs, selects, vote chip, icon tiles, nav items |
| `xl`             | 8.4px  | Marketing cards, dialogs, empty-state panels               |
| `2xl`            | 10.8px | Marketing CTA card                                         |
| `card`           | 16px   | App entity cards and the `Card` primitive                  |
| `4xl` / pill     | 15.6px | Badges (20px tall, reads as a full pill)                   |
| `full`           | 9999px | Avatars, step pills, dots                                  |

Borders are 1px `border`. Dashed hairline is reserved for empty states.

## Components

Class strings below are Tailwind v4. They are the exact recipes used in the source.

### Buttons

- **Base:** `inline-flex items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all`; press `active:translate-y-px`; disabled `opacity-50 pointer-events-none`; icons `size-4`, `gap-2`.
- **Focus:** `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`. Invalid adds `border-destructive ring-destructive/20`.
- **Sizes:** `xs` 28px (12px text), `sm` 32px (12.8px text), **default 36px** (`px-4`), `lg` 40px (`px-6`); icon buttons 28 / 32 / 36 / 40px squares.
- **Variants:**
  - `default`: `bg-primary text-primary-foreground hover:bg-primary-hover`. **One per view.**
  - `outline`: `border-border bg-background hover:bg-muted`; dark `dark:border-input dark:bg-input/30`.
  - `secondary`: `bg-secondary`, hover mixes 5% foreground.
  - `ghost`: transparent, `hover:bg-muted`.
  - `destructive`: a _soft_ button, `bg-destructive/10 text-destructive hover:bg-destructive/20`. Destructive is never a solid red fill.
  - `link`: `text-primary underline-offset-4 hover:underline`.
- A navigation control that looks like a button is a real link styled with the same variants, not a `role="button"`.

### Inputs and fields

- **Input:** `h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1`, text `16px` on phones and `14px` from `md` (prevents iOS zoom). Placeholder `muted-foreground`. Focus `border-ring ring-3 ring-ring/50`. Invalid `border-destructive ring-destructive/20`. Disabled `opacity-50`. Dark adds `bg-input/30`.
- **Textarea:** same border/focus, `min-h-16 px-2.5 py-2`, `field-sizing: content`.
- **Select trigger:** 36px (`sm` 32px), chevron `muted-foreground`; menu is a popover (see below).
- **Radio:** 16px circle, checked fills `primary`.
- **Field wrapper:** `space-y-1.5` label (14px 500) → optional hint (12px muted) → control → error (14px `destructive`).
- **Icon input:** leading 16px muted icon at `left-2.5`, input `pl-8`.

### Badges

20px pill (`h-5 px-2 py-0.5 rounded-4xl text-xs font-medium`, icons `size-3`). Variants: `default` (primary fill), `secondary` (oat), **`soft`** (`bg-primary-soft text-primary-text`), `outline` (hairline, foreground text), `success` / `warning` / `info` (soft ground + solid text), `destructive` (10% tint). Data-driven badges pass an inline `{background, color}` from the Tinted Badge Rule. Show **one coloured answer** per row: if a decision label equals the status name, the decision keeps its colour and the status drops to an outline badge.

### Cards

- **`Card` primitive:** `bg-card rounded-card border shadow-card`, padding `20px` (`sm`: 16px), header/content/footer slots, footer is `bg-muted/50 border-t`.
- **Marketing card:** `rounded-xl border border-border bg-card p-6`, no shadow. Structure: 36px icon tile → title (600) `mb-1.5` → description (14px muted). Variants: a corner step number (`font-mono text-3xl font-bold text-muted-foreground/30`), a muted icon tile for use-case cards (`bg-muted text-foreground`), a "Planned" `secondary` badge beside the title.
- **Icon tile:** `size-9 rounded-lg bg-primary/10 text-primary` with a 20px icon.
- **Pricing card:** marketing card plus price at 30px 700; highlighted plan adds `border-primary ring-2 ring-primary/20` and a "Popular" badge; feature list uses a 16px `primary` check; button is `default` when highlighted, `outline` otherwise, full width.
- **Entity card (app):** `rounded-card border bg-surface-raised p-5 shadow-card`; hover `border-primary shadow-raised -translate-y-0.5` over 200ms; whole card is one click target (title link stretched with `after:absolute after:inset-0`). Order: badges row → 16px 600 title → muted subtitle → 3-line muted description → 12px muted meta row (icon + value) → tags → pinned footer with a top hairline.

### Navigation

- **Marketing header:** `h-16 sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm`. Logo left; links 14px 500, `muted-foreground` → `foreground` on hover, current is `foreground`, `rounded-md px-3 py-2`; right side: ghost "Log in" + primary "Start Free". Below `md` a menu button opens a right sheet.
- **Marketing footer:** `border-t py-10`, logo, centred 14px muted copyright line, 14px muted links with hover underline (`underline-offset-4`).
- **App sidebar:** 240px `bg-sidebar border-r`; a 56px logo row, the org switcher in a `p-3` bordered block, then nav. Items `rounded-control px-3 py-2 gap-3 text-sm font-medium` with a 16px icon; **active** `bg-primary-soft text-primary-text`; idle `text-muted-foreground`, hover `bg-primary-soft text-primary-text`. Secondary items (Help) sit under a hairline at the bottom.
- **App top bar:** `h-14 sticky z-40 border-b bg-background/85 backdrop-blur-md`; notification bell and a 32px avatar menu on the right.
- **Breadcrumbs:** 14px muted, 14px chevrons, current page `foreground` 500, links underline on hover, truncated at `max-w-56`/`72`.
- **Tabs:** default list is an oat pill (`bg-muted`, 32px, `p-[3px]`, `rounded-lg`) with the active tab on `bg-background` and `shadow-sm`; `line` variant is transparent with a 2px foreground underline on the active tab.
- **Public top bar:** white, hairline bottom, a **3px `primary` rule on top**, 56px bar, tabs 14px 600 `rounded-md` with current `primary-soft` / `primary-text`.

### Overlays

- **Drawer (sheet):** the default place for create, edit and settings. Slides from the right over **300ms** (`ease-out`); width is `w-3/4` capped at `sm:max-w-sm` by default, `lg` = `max-w-lg`, `xl` = `max-w-2xl`; full width below `sm` for the wide variants. Fixed header (`p-4 border-b`, title 18px 600, optional description and sub-header, optional action beside the close button separated by a 1px `border-strong` rule) over a scrolling `p-4` body. Close button is an `icon-sm` ghost at top-right.
- **Dialog:** centred, `max-w-sm`, `rounded-xl p-4 ring-1 ring-foreground/10`, footer `bg-muted/50 border-t` with actions right-aligned. Reserved for confirmations.
- **Menu / select / popover:** `bg-popover rounded-lg p-1 shadow-md ring-1 ring-foreground/10`, 100ms fade + zoom-95 + slide-2. Items `rounded-md px-1.5 py-1 text-sm`; focus `bg-accent text-accent-foreground`; destructive items `text-destructive` with a 10% focus tint; labels 12px 500 muted; separators `bg-border h-px`.
- **Tooltip:** inverted (`bg-foreground text-background`), `rounded-md px-3 py-1.5 text-xs`, `max-w-xs`, with a 10px arrow.
- **Toast (Sonner):** popover background, `border` colour, radius `var(--radius)`, 16px lucide status icons.
- **Skeleton:** `bg-muted animate-pulse rounded-md`.

### Tables and lists

- **`Table` primitive (app):** 14px, header `h-10 px-2 font-medium`, cells `p-2`, rows `border-b hover:bg-muted/50`, selected `bg-muted`.
- **Public data grid:** header cells 12px 600 `muted-foreground` on white, sticky under the top bar, row hairline bottom, hover `muted` at 60%, selected `primary-soft` with `aria-current="true"`; `px-3 py-3` cells; whole row clickable except inner links.
- **`ConfigList`:** `divide-y border-b`, rows `py-3` with a 14px 600 name, optional badges, 12px muted description and a single ellipsis menu. An editing row becomes cream (`bg-sidebar -mx-3 rounded-lg px-3 py-4`) with white fields.

### Accordion (FAQ)

Rows separated by a bottom hairline, trigger `py-2.5 text-sm font-medium` with a right-aligned 16px muted chevron and underline on hover, panel text `muted-foreground`, height animated. Centred at `max-w-2xl`.

### Avatar and identity

- Avatar 32px (24 / 40 alternates), `rounded-full`, fallback `bg-muted text-muted-foreground`, inset 1px border; initials are up to two letters.
- **Logo mark:** a terracotta speech-bubble with three dots, 28px default (36px in marketing), wordmark "Doxa" 16px 700, optional tagline "Listen. Understand. Decide." at 11px.
- **Org monogram:** up to two bold white initials on `primary`, `rounded-lg`, font-size 40% of the tile; used whenever an organisation has no logo. A logo wider than 2.2:1 is a wordmark and the name is dropped beside it.

### Marketing composites

- **Hero:** display heading, lead, then a `lg` primary button plus an `lg` outline button; the right column is an illustrative product card (`Card size=sm shadow-lg`, `aria-hidden`), not a screenshot.
- **Section heading:** optional eyebrow → section title → lead, all centred inside `max-w-2xl`, `space-y-3`.
- **Step pills:** `rounded-full border bg-card px-5 py-2.5 text-sm font-medium` joined by 16px muted chevrons.
- **Bullet dots:** 6px `primary` circles at `mt-1.5`.
- **CTA, card variant:** `rounded-2xl border bg-card px-6 py-14 sm:px-12`. **Banner variant:** full-bleed `bg-primary`, title `text-primary-foreground`, lead at 80% white, primary button inverted to `bg-background text-foreground` with a trailing arrow, secondary button a transparent outline with a 30% white border.
- **Legal shell:** `max-w-2xl`, title 30px 700, "Last updated" 14px muted, `h2` 18px 600 with `mt-8 mb-2`, paragraphs and lists `muted-foreground leading-relaxed`.
- **Auth frame:** two columns. Left (lg only, 58%) is a full-bleed `primary` panel with `p-12`, a white-filtered logo, a huge 10rem white/15 quote mark, a 1.6rem 600 white quote, a 14px white/60 attribution, and a white/15 oversized logo bleeding off the right edge. Right is `bg-muted`, centred, form at `max-w-sm`, with the logo, `h1` 24px 700 and tagline above. When a visitor arrives from a public board, the Doxa panel steps aside and the organisation's mark, name and accent lead instead.

### Vote chip (signature component)

44 × 48px, `rounded-lg`, 1px border, chevron-up over a 13px 700 tabular count. **Idle:** white, hairline; hover switches border and text to `primary-text`. **Voted:** `primary` fill, white text, `aria-pressed="true"`. **Closed** (unavailable): oat fill, muted text, disabled, with the reason as its title. Focus: 2px `ring` with 1px offset. Voting is optimistic and reverts with a toast on failure. It is the first cell of every row and repeats inside the drawer.

### Empty states

A dashed hairline panel, `rounded-xl`, centred, 64px vertical padding: a 14px 600 statement, one line of muted copy (`max-w-sm`), then the single next action. The filled primary button is never duplicated; a repeated action is outline.

### Public item drawer

Right-hand `xl` drawer that opens **on the click**, before the server answers: title the row already has, skeleton lines for the rest. Header: title (20px 700, 4-line clamp) with "Open page" and close; status and decision badges; type and board; byline. Body: Details, the team's decision in a tinted panel, vote/follow actions, hairline, discussion. The URL carries the state (`?item=slug`) so it is shareable and refresh-safe.

## Motion

Motion is feedback: it answers an action and stops. No decorative or scroll-linked animation.

| Interaction                       | Duration                 | Easing                          | Notes                                                                   |
| --------------------------------- | ------------------------ | ------------------------------- | ----------------------------------------------------------------------- |
| Hover / colour transitions        | 150ms (Tailwind default) | ease                            | `transition-colors` / `transition-all`                                  |
| Button press                      | instant                  | n/a                             | `translate-y-px`                                                        |
| Menus, selects, popovers, dialogs | 100ms                    | ease-out                        | fade + zoom-95 + 8px slide                                              |
| Sheet / drawer                    | 300ms                    | ease-out                        | keyframe `slide-in-from-*`, scrim fades with it; close slides out first |
| Entity card hover                 | 200ms                    | ease                            | border colour, shadow, `-0.5` lift                                      |
| Results dimming while filtering   | 150ms, 120ms delay       | ease-out                        | table opacity to 0.55                                                   |
| Vote count roll                   | 280ms                    | `cubic-bezier(0.16, 1, 0.3, 1)` | moves 0.9em in the direction of change, clipped in the chip             |
| First-vote ring                   | 520ms                    | same expo-out                   | 1px ring expands 10px, 45% accent fading to 0                           |
| Re-rank glide                     | 380ms                    | same expo-out                   | only for rows that move within ~3s of a vote                            |
| Skeleton                          | pulse                    | n/a                             | Tailwind `animate-pulse`                                                |

**Reduced motion:** a global rule sets animation and transition durations to `0.01ms`, iteration count to 1 and `scroll-behavior: auto`; the vote roll is replaced by a 200ms in-place fade so the meaning survives.

## Accessibility

- WCAG AA is the target. Text pairs: foreground 17.5:1, muted-foreground 4.80:1 on white, `primary-text` 6.38:1, semantic solids on their soft grounds 5.4–5.9:1 (light) and 8.8–10:1 (dark).
- Focus is always visible: a 3px ring at 50% alpha plus a `ring` border colour. Custom controls use a 2px ring with offset.
- Lists of comparable records are real tables with a caption, `scope="col"` headers and `aria-sort`. Current nav uses `aria-current`. Toggles expose `aria-pressed` / `aria-expanded`.
- Decorative icons are `aria-hidden`; icon-only buttons carry an `aria-label` or sr-only text.
- Touch text inputs are 16px below `md`.
- Organisation-supplied colours never reach text or a white-text ground without correction (see the rules in Colors).

## Do's and Don'ts

**Do**

- Take every accent from the four accent tokens; pass any third-party colour through the contrast-correcting helpers before it touches text.
- Keep one filled `primary` button per view; repeat actions as `outline`.
- Use a real table for lists of comparable records and cards for entities that have several facts and an open action.
- Put create, edit and settings flows in the right-hand drawer; keep dialogs for confirmation.
- Alternate white and oat bands on marketing pages and separate them with `border-t`.
- Use `tabular-nums` on every count and sentence case everywhere except the eyebrow.
- Keep motion to 100–380ms feedback and always give it a reduced-motion path.
- Design the unbranded, nothing-configured state as the finished page.

**Don't**

- Don't add a second accent colour or a gradient.
- Don't use `primary` as small text or a raw org colour behind white text.
- Don't add shadows to rows, chips, badges or list items, and don't lift a selected row; tint it.
- Don't use solid red for destructive buttons; use the soft variant.
- Don't put comparable records (roadmap entries, grid rows) in same-size cards on the public surface.
- Don't introduce type sizes outside the scale, or fluid type.
- Don't fly or morph an element from a row into the drawer; the drawer slides in and the row keeps its place.
- Don't format dates with locale- or zone-dependent calls; server and browser must agree.

## Implementing the tokens

### Paste-ready CSS (Tailwind v4 + shadcn variable contract)

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-hover: var(--primary-hover);
  --color-primary-soft: var(--primary-soft);
  --color-primary-text: var(--primary-text);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-soft: var(--destructive-soft);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-warning: var(--warning);
  --color-warning-soft: var(--warning-soft);
  --color-info: var(--info);
  --color-info-soft: var(--info-soft);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --radius-control: 6px;
  --radius-card: 16px;
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  --shadow-card: 0 1px 2px 0 #1010140a, 0 1px 3px 0 #1010140f;
  --shadow-raised: 0 2px 4px -1px #1010140f, 0 8px 24px -6px #1010141f;
}

:root {
  color-scheme: light;
  --radius: 0.375rem;

  --background: #ffffff;
  --foreground: #1c1917;
  --card: #ffffff;
  --card-foreground: #1c1917;
  --popover: #ffffff;
  --popover-foreground: #1c1917;

  --primary: #c74504;
  --primary-foreground: #ffffff;
  --primary-hover: #a93a03;
  --primary-soft: #fdefe7;
  --primary-text: #a93a03;

  --secondary: #f4f2ea;
  --secondary-foreground: #1c1917;
  --muted: #f4f2ea;
  --muted-foreground: #78716c;
  --accent: #fdefe7;
  --accent-foreground: #a93a03;

  --destructive: #b3261e;
  --destructive-soft: #fdeceb;
  --success: #146c43;
  --success-soft: #e6f4ec;
  --warning: #8a5a00;
  --warning-soft: #fdf3e0;
  --info: #1f5f9e;
  --info-soft: #ebf3fb;

  --border: #e8ddc8;
  --border-strong: #d6c7ab;
  --input: #e8ddc8;
  --ring: #c74504;

  --surface: #fffaef;
  --surface-raised: #ffffff;

  --sidebar: #fffaef;
  --sidebar-foreground: #1c1917;
  --sidebar-border: #e8ddc8;
  --sidebar-primary: #c74504;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #fdefe7;
  --sidebar-accent-foreground: #a93a03;
  --sidebar-ring: #c74504;

  --chart-1: #c74504;
  --chart-2: #f59e0b;
  --chart-3: #84cc16;
  --chart-4: #06b6d4;
  --chart-5: #8b5cf6;
}

.dark {
  color-scheme: dark;
  --background: #12100e;
  --foreground: #faf7f2;
  --card: #1c1916;
  --card-foreground: #faf7f2;
  --popover: #1c1916;
  --popover-foreground: #faf7f2;

  --primary: #c74504;
  --primary-foreground: #ffffff;
  --primary-hover: #dd5211;
  --primary-soft: #26130a;
  --primary-text: #ff8a5c;

  --secondary: #27221e;
  --secondary-foreground: #faf7f2;
  --muted: #27221e;
  --muted-foreground: #a8a097;
  --accent: #26130a;
  --accent-foreground: #ff8a5c;

  --destructive: #ff9d95;
  --destructive-soft: #2e1513;
  --success: #7ee2ab;
  --success-soft: #10281c;
  --warning: #f5c26b;
  --warning-soft: #2b2110;
  --info: #8cc2f5;
  --info-soft: #10202e;

  --border: #302a25;
  --border-strong: #453d35;
  --input: #302a25;
  --ring: #ff8a5c;

  --surface: #181512;
  --surface-raised: #1c1916;

  --sidebar: #181512;
  --sidebar-foreground: #faf7f2;
  --sidebar-border: #302a25;
  --sidebar-primary: #c74504;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #26130a;
  --sidebar-accent-foreground: #ff8a5c;
  --sidebar-ring: #ff8a5c;

  --chart-1: #e2680f;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Theme switching (Next.js)

Dark mode is the `dark` class on `<html>`. Keep the choice (`light`, `dark`, or absent for system) in `localStorage` under `theme`, apply it as the `dark` class on `<html>`, and put `suppressHydrationWarning` on `<html>`. A small inline script in `<head>` (rendered by the root layout, a Server Component) sets the class before first paint so dark never flashes light; a client provider holds the choice with `useSyncExternalStore` and switches without animating every transition. Don't use `next-themes` 0.4.x with React 19: its provider renders the script from a client component, which React warns about. The switcher is a ghost icon button with a three-option radio menu (Light, Dark, System); the trigger icon swaps with `dark:hidden` / `hidden dark:block` so it needs no mounted state. It sits in the top bar of every surface: marketing header (and beside the mobile menu button), app top bar, public board top bar. `color-scheme` is set per theme so native controls and scrollbars follow.

### Fonts (Next.js)

```tsx
import { Manrope, Geist_Mono } from "next/font/google";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// <html lang="en" className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}>
```

Outside Next.js, load Manrope 400/500/600/700 and map it to `--font-sans`.

### Component stack

shadcn `base-nova` style on `@base-ui/react`, `class-variance-authority`, `lucide-react`, `sonner`, `tw-animate-css`. `components.json`: `"style": "base-nova"`, `"baseColor": "neutral"`, `"cssVariables": true`, `"iconLibrary": "lucide"`. The token names above are the shadcn contract plus the additions `primary-hover`, `primary-soft`, `primary-text`, `surface`, `surface-raised`, `border-strong` and the `*-soft` semantic grounds.

### Org-led theming

For a product where an end customer supplies a brand colour, re-point the accent tokens at runtime on `:root` (so portalled drawers inherit them), after correcting for contrast:

```ts
// 1. primary: darken the accent in 6% steps toward black until white text on it is >= 4.5:1
// 2. primary-soft: primary mixed 10% into white
// 3. primary-text: primary darkened in 6% steps until it is >= 4.5:1 on primary-soft
// 4. primary-hover: primary mixed 16% toward black
// 5. ring, accent, accent-foreground, sidebar-primary, sidebar-ring follow
// badgeColors(c): ground = c at 13% over white; text = c darkened in 6% steps until >= 4.5:1 on the ground
// Invalid or unset input writes nothing, so the default terracotta stands.
```

For the dark theme the same inputs produce a second set in a `.dark{…}` block written after the `:root` one: `primary` is unchanged (white text on it passes in both), `primary-soft` is the accent mixed 16% into the dark background, `primary-text` is the accent lightened in 6% steps until it reaches 4.5:1 on that tint (also used for `ring` and `accent-foreground`), `primary-hover` is the accent mixed 14% toward white. Tinted badges use CSS `light-dark(lightPair, darkPair)` with the dark ground at 22% of the colour over the dark background, so they need no theme prop.

Emit the light set as `:root{--primary:…;--primary-hover:…;--primary-soft:…;--primary-text:…;--ring:…;--accent:…;--accent-foreground:…}` and validate the input as a six-digit hex first so nothing but a colour reaches the stylesheet. The masthead tint (`color-mix(in oklab, var(--primary) 5%, var(--background))`), text selection, caret and scrollbar colours all read from `--primary`, so they follow the override with no extra work.

### Public-surface helpers

```css
.public-surface {
  caret-color: var(--primary);
  scrollbar-color: var(--border-strong) transparent;
}
.public-surface ::selection {
  background: var(--primary-soft);
  color: var(--foreground);
}
.public-masthead {
  background: color-mix(in oklab, var(--primary) 5%, var(--background));
}

.vote-roll[data-dir="up"] {
  animation: vote-roll-up 280ms cubic-bezier(0.16, 1, 0.3, 1);
}
.vote-roll[data-dir="down"] {
  animation: vote-roll-down 280ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes vote-roll-up {
  from {
    transform: translateY(0.9em);
    opacity: 0;
  }
}
@keyframes vote-roll-down {
  from {
    transform: translateY(-0.9em);
    opacity: 0;
  }
}
.vote-chip[data-pulse]::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  animation: vote-pulse 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes vote-pulse {
  from {
    box-shadow: 0 0 0 0 color-mix(in oklab, var(--primary) 45%, transparent);
  }
  to {
    box-shadow: 0 0 0 10px color-mix(in oklab, var(--primary) 0%, transparent);
  }
}
@media (prefers-reduced-motion: reduce) {
  .vote-roll[data-dir] {
    animation: vote-fade 200ms ease-out !important;
  }
  @keyframes vote-fade {
    from {
      opacity: 0.2;
    }
  }
}
```

## Source map

For anyone who wants to check a value against the original.

| Topic                                                         | Location                                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Tokens, dark mode, motion, public helpers                     | `src/app/globals.css`                                                                                    |
| Fonts, root layout                                            | `src/app/layout.tsx`                                                                                     |
| Buttons, badges, inputs, sheets, dialogs, menus, tabs, tables | `src/components/ui/*`                                                                                    |
| Marketing components                                          | `src/components/marketing/*`, `src/app/(marketing)/_sections/*`                                          |
| App shell, page shell, sidebar, entity cards, drawer          | `src/components/app-shell.tsx`, `page-shell.tsx`, `org-sidebar-nav.tsx`, `entity-card.tsx`, `drawer.tsx` |
| Auth frame                                                    | `src/app/(auth)/layout.tsx`, `src/components/auth/*`                                                     |
| Contrast-correcting colour helpers                            | `src/lib/brand-color.ts`, `src/components/public/brand-style.tsx`                                        |
| Public board detail (repo-specific)                           | `DESIGN.md`                                                                                              |
