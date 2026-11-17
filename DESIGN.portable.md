---
name: Doxa (portable)
description: White paper on a pale butter desk. One amber accent, Newsreader headlines over DM Sans, butter hairlines, pill buttons and flat depth. Covers the marketing site, the authenticated app and the public feedback board. Copy this file into another project as DESIGN.md.
colors:
  accent: "#e8b923"
  accent-hover: "#d4a615"
  accent-text: "#826400"
  accent-tint: "#faf4df"
  on-accent: "#353335"
  background: "#ffffff"
  desk: "#fcfaf3"
  sand: "#f8f4e4"
  ink: "#4d4a4d"
  ink-strong: "#353335"
  ink-muted: "#6b6b6b"
  hairline: "#ece5cc"
  hairline-strong: "#dccfa6"
  control-border: "#8a7f6e"
  success: "#146c43"
  success-soft: "#e6f4ec"
  warning: "#8a5a00"
  warning-soft: "#fdf3e0"
  info: "#1f5f9e"
  info-soft: "#ebf3fb"
  destructive: "#b3261e"
  destructive-soft: "#fdeceb"
  dark-background: "#141312"
  dark-card: "#1c1b19"
  dark-desk: "#181716"
  dark-sand: "#262420"
  dark-ink: "#e6e2da"
  dark-ink-strong: "#faf8f2"
  dark-ink-muted: "#a8a399"
  dark-hairline: "#2e2b26"
  dark-hairline-strong: "#433e35"
  dark-control-border: "#7d7569"
  dark-accent-text: "#f0c94a"
  dark-accent-tint: "#2a2410"
  dark-success: "#7ee2ab"
  dark-warning: "#f5c26b"
  dark-info: "#8cc2f5"
  dark-destructive: "#ff9d95"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  page-title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.56
  title:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  body-reading:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  caption:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.33
  stat-numeral:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum"
rounded:
  input: "8px"
  menu: "12px"
  card: "20px"
  pill: "9999px"
spacing:
  base: "4px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  section-y: "64px"
  section-y-lg: "80px"
  container-marketing: "1152px"
  container-app-page: "1440px"
  container-board: "1400px"
  container-legal: "768px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "0 16px"
  button-ghost-hover:
    backgroundColor: "{colors.sand}"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    height: "40px"
    padding: "4px 12px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  badge-soft:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "20px"
    padding: "2px 8px"
  badge-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "20px"
    padding: "2px 8px"
  nav-item-current:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  sidebar:
    backgroundColor: "{colors.desk}"
    textColor: "{colors.ink}"
    width: "240px"
  band-desk:
    backgroundColor: "{colors.desk}"
    textColor: "{colors.ink}"
    padding: "80px 24px"
  icon-tile:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.input}"
    size: "36px"
  vote-chip:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.stat-numeral}"
    rounded: "{rounded.input}"
    width: "44px"
    height: "48px"
  vote-chip-voted:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
---

# Design System: Doxa

Extracted from the Doxa codebase (Next.js, Tailwind CSS v4, shadcn `base-nova` on Base UI, lucide icons). It describes three surfaces that share one token set: the **marketing site**, the **authenticated app** and the **public feedback board**. The tokens are the SiteNest "Butter" set. Drop this file into another project as `DESIGN.md` and use the paste-ready block in [Implementing the tokens](#implementing-the-tokens). Public-board specifics (data grid, drawer, vote chip, roadmap) live in the repo's `DESIGN.md`.

## Overview

**Creative North Star: "White Paper on a Butter Desk"**

White is paper (cards, grids, forms, inputs, drawers). Pale butter (`desk`, #fcfaf3) is the desk: sidebar, marketing bands, legal and auth grounds. `sand` (#f8f4e4) is the stronger butter wash for hover and secondary tints. Amber (`accent`, #e8b923) is a **fill** that marks what is actionable or selected; ochre (`accent-text`, #826400) is the only accent allowed as text and is also the focus colour. Newsreader carries headlines, DM Sans carries everything else. Depth is ground plus 1px hairline; nothing glows.

| Surface      | Mode          | Density                      | Container                         | Signature                                                                              |
| ------------ | ------------- | ---------------------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| Marketing    | Persuade      | Airy: 64-80px section rhythm | 1152px, centred                   | Alternating desk / white bands, ochre phrase in the hero, MacBook holding real captures |
| App          | Operate       | Medium: 24px stack rhythm    | 240px desk sidebar + 1440px page  | Desk sidebar with pill nav, bordered 20px cards, right-hand drawers for create/edit    |
| Public board | Scan and vote | Dense: table rows            | 1400px, full-width ledger         | Real data table, vote chip, tinted masthead, org-owned accent                          |

**Key characteristics**

- **One amber voice.** Fill, never small text. Text on amber is charcoal (`on-accent`, #353335), never white. Org accents on public boards get white foreground; the unbranded default keeps charcoal.
- **Newsreader 400** (variable, optical-size axis) for every `h1`/`h2` and `.font-display`, enforced by one unlayered rule so a stray `font-bold` cannot change it; **DM Sans** for everything else; `font-bold` and `font-extrabold` resolve to 600.
- **Shape:** every button, chip and nav item is a pill; inputs, textareas, selects 8px; menus and popovers about 12px; cards, panels and dialogs 20px.
- **Selection is butter:** selected tab, nav item, row = `accent-tint` with `accent-text`; hover = `sand`. No grey foreground-opacity washes.
- **Light or dark only.** No system option. A sun/moon pill toggle in every header; stored in `localStorage` under `theme`; default light. Dark is a warm charcoal ramp, never neutral grey.
- **Flat at rest.** Shadows are for overlays and for the one picture of a device (the MacBook mockup).
- Icons are lucide, 16px inline. Tabular numerals wherever numbers are compared.

## Colors

### Accent

| Token (CSS var)                          | Light     | Dark      | Role                                                                                  |
| ---------------------------------------- | --------- | --------- | ------------------------------------------------------------------------------------- |
| `accent` (`--primary`)                   | `#e8b923` | `#e8b923` | Primary button, voted chip, monogram, logo mark, top-bar rule, chart fill.            |
| `accent-hover` (`--primary-hover`)       | `#d4a615` | `#f0c94a` | Hover of the fill.                                                                    |
| `accent-text` (`--primary-text`, `--accent-foreground`, `--ring`) | `#826400` | `#f0c94a` | Accent as text, links, focus ring, active nav text. |
| `accent-tint` (`--primary-soft`, `--accent`) | `#faf4df` | `#2a2410` | Accent as a ground: selected items, soft badges, icon tiles, selection.            |
| `on-accent` (`--primary-foreground`)     | `#353335` | `#353335` | Text on the amber fill.                                                               |

### Neutrals

| Token                                  | Light     | Dark      | Role                                                                 |
| -------------------------------------- | --------- | --------- | -------------------------------------------------------------------- |
| `background`, `card`, `popover`        | `#ffffff` | `#141312` / `#1c1b19` | Paper: page, cards, inputs, drawers (dark ground / dark cards). |
| `desk` (`--surface`, `--sidebar`)      | `#fcfaf3` | `#181716` | Chrome: sidebar, marketing bands, legal and auth grounds.            |
| `sand` (`--secondary`, `--muted`)      | `#f8f4e4` | `#262420` | Hover wash, secondary tint, disabled, skeletons.                     |
| `ink` (`--ink`)                        | `#4d4a4d` | `#e6e2da` | Body text.                                                           |
| `ink-strong` (`--foreground`)          | `#353335` | `#faf8f2` | Headings, button labels, vote counts.                                |
| `ink-muted` (`--muted-foreground`)     | `#6b6b6b` | `#a8a399` | Secondary copy, meta, placeholders.                                  |
| `hairline` (`--border`)                | `#ece5cc` | `#2e2b26` | Borders and dividers.                                                |
| `hairline-strong` (`--border-strong`)  | `#dccfa6` | `#433e35` | Outline buttons, menus, scrollbar thumb, dashed zones.               |
| `control-border` (`--input`)           | `#8a7f6e` | `#7d7569` | Outlines of text fields, selects, textareas (meets 3:1).             |

### Semantic

`success` `#146c43` / `#e6f4ec` (dark `#7ee2ab` / `#10281c`), `warning` `#8a5a00` / `#fdf3e0` (dark `#f5c26b` / `#2b2110`), `info` `#1f5f9e` / `#ebf3fb` (dark `#8cc2f5` / `#10202e`), `destructive` `#b3261e` / `#fdeceb` (dark `#ff9d95` / `#2e1513`). Solid for text and icons, `-soft` for grounds. Destructive actions are an outline button with red text, never a solid red block.

### Data colours

Charts: `#e8b923`, `#826400`, `#146c43`, `#1f5f9e`, `#8a7f6e` (dark: `#e8b923`, `#f0c94a`, `#7ee2ab`, `#8cc2f5`, `#a8a399`). Decision types come from data (Planned, In progress, Completed, Declined, Deferred, Duplicate) and always render through the tinted-badge rule.

### Named rules

**The One Voice Rule.** Amber is the only brand accent and it is a fill. Accent as text is ochre.

**The Token Only Rule.** No literal brand hex, `bg-white` or hard-coded cream in components; use `primary`, `surface`, `card`, `popover` so dark mode holds.

**The Tinted Badge Rule.** Any data-driven colour on a badge is the colour at 13% over the background as ground and the colour darkened in 6% steps until it reaches 4.5:1 on that ground as text.

**The Org-Led Accent Rule (public board only).** The accent belongs to the organisation. Never write an amber hex or fixed class there; use `primary`, `primary-hover`, `primary-soft`, `primary-text` so the runtime override flows into portalled drawers. See [Org-led theming](#org-led-theming).

**The Masthead Tint Rule.** A page's introducing band is `color-mix(in oklab, var(--primary) 5%, var(--background))`.

### Known gaps

- `ink-muted` (#6b6b6b) is about 5.3:1 on white and about 4.9:1 on `sand`; fine for small text on both.
- `hairline` (#ece5cc) on white is decorative (about 1.3:1); field boundaries rely on `control-border`, not `hairline`.
- The one-off MacBook greys (`#1b1a1a` bezel, `#c9c5bd` deck, dark `#2b2927` bezel, `#3d3a36` deck) are literal values inside the mockup, not tokens.
- Public nav tabs on the board are `rounded-md`, not pills; incumbent drift, not a rule.

## Typography

**Display:** Newsreader, weight 400, variable with the optical-size axis (`font-optical-sizing: auto`), Georgia fallback. **Body:** DM Sans, `ui-sans-serif, system-ui, sans-serif` fallback. **Mono:** Geist Mono (loaded app-wide; invite codes and step indices). Set `antialiased` on `<html>`.

**Character:** a quiet serif for headlines over a plain humanist sans for work. Hierarchy is the face switch plus weight (400/500/600) and a short size scale.

### Scale

| Role          | Size / line                        | Face and weight          | Tracking | Where                                                        |
| ------------- | ---------------------------------- | ------------------------ | -------- | ------------------------------------------------------------ |
| Display       | 48 / 72px (base / sm), leading 1   | Newsreader 400           | -0.02em  | Marketing hero `h1`, `text-balance`, one ochre phrase        |
| Section title | 30 / 36px                          | Newsreader 400           | -0.02em  | Marketing `h2`, legal `h1` (36 / 48px)                       |
| Page title    | 24-28px                            | Newsreader 400           | -0.02em  | App page headers, board / roadmap / item title (28px)       |
| Lead          | 18px / 28                          | DM Sans 400, muted       | normal   | Marketing sub-headline, `text-balance`                       |
| Title         | 16-20px                            | DM Sans 600              | normal   | Card titles, drawer title (h3/h4 are DM Sans)                |
| Body          | 14px / 20                          | DM Sans 400 (500 controls) | normal | App default, table cells, inputs at `md+`                    |
| Reading       | 15px / 26-28                       | DM Sans 400              | normal   | Long descriptions, `max-w-prose`                             |
| Caption       | 13px / 20                          | DM Sans 400              | normal   | One-line descriptions, bylines                               |
| Label         | 12px / 16                          | DM Sans 600              | normal   | Column headers, badges, timestamps                           |
| Stat numeral  | 13px                               | DM Sans 600, `tabular-nums` | normal | Vote counts, totals                                         |

### Named rules

**The One Heading Rule.** Every `h1`/`h2`/`.font-display` is Newsreader 400 with optical sizing. Do not add `font-bold` to change it. Headings that must read as sans (inside cards or drawers) carry `font-sans` (or live in `.doc-card`) and render DM Sans 600.

**The Fixed Scale Rule.** App and board sizes are 12, 13, 14, 15, 16, 28px; marketing steps display sizes by breakpoint. No fluid `clamp()`.

**The Tabular Numerals Rule.** Counts and totals use `tabular-nums`.

**The Sentence Case Rule.** Buttons, headers, badges and nav are sentence case; no uppercase eyebrows or letter-spaced labels.

**The Balance Rule.** Marketing headings and leads use `text-wrap: balance`; body paragraphs do not.

## Layout and spacing

**Base unit 4px.** Common steps: 4, 8, 12, 16, 20, 24, 32, 40, 64, 80.

| Surface                    | Max width           | Gutters (base / sm / lg)                   |
| -------------------------- | ------------------- | ------------------------------------------ |
| Marketing                  | `max-w-6xl` 1152px  | 16 / 24 / 24                               |
| App page (`PageContainer`) | `max-w-[1440px]`    | 16 / 24 / 32, `py-8`, children `space-y-6` |
| Public board               | 1400px              | 16 / 24 / 32                               |
| Legal / About              | `max-w-3xl` 768px   | 16 / 24, `py-16 sm:py-20`                  |
| Auth form                  | `max-w-sm` 384px    | 24                                         |

### Marketing rhythm

- Sections are full-bleed bands that **alternate `desk` and white**, separated by `border-t`; inside `max-w-6xl`, `py-16 sm:py-20`. The closing CTA is a white band, not an amber one.
- Hero on desk: soft badge, display `h1` with one `text-primary-text` phrase, lead, `lg` primary plus `lg` outline pill. Beneath, a hard split (desk down to 30%, white below, no gradient softening) behind a MacBook that straddles both. A caption reads "Sample board with example data."
- Card grids: `grid-cols-1 gap-4`, `sm:grid-cols-2`, `lg:grid-cols-3`. Sticky header `h-16`.

### App rhythm

Shell is `h-dvh`: a 240px desk sidebar (hidden below `md`, reopened as a left sheet), a 56px sticky top bar with theme toggle and account menu, a scrolling `main`. Page = `PageContainer` > `PageHeader` > content, actions top right. Entity grids `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.

### Public board rhythm

Sticky top bar (3px accent rule + 56px bar), a tinted masthead (`py-8`), a content band (`pt-6`), one hairline footer row. The list is a real `<table>` with columns disclosed by breakpoint (`md`, `xl`). Nothing on the board is nested in a card.

### Breakpoints

Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

## Elevation and depth

Flat and tonal. Surfaces separate by 1px hairline and by ground (white and desk).

| Token                   | Value                                                          | Used for                                                |
| ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `.device-shadow`        | `0 2px 4px -1px #1b1a1a14, 0 40px 80px -24px #1b1a1a40`         | The MacBook mockup only                                 |
| `shadow-raised`         | `0 2px 4px -1px #1010140f, 0 8px 24px -6px #1010141f`           | App entity card on hover                                |
| `shadow-md` + `ring-1 ring-foreground/10` | Tailwind                                      | Menus, selects, popovers                                |
| `shadow-drawer`         | `-12px 0 40px -12px #1b1a1a33`                                 | Sheets and drawers                                      |
| `shadow-raised`         | (as above)                                                     | Dialogs                                                 |
| Overlay                 | `bg-black/40`, no blur                                         | Behind sheets and dialogs                               |

**The Flat At Rest Rule.** Rows, controls, chips, badges, resting cards carry no shadow. Selected is a tint, not a lift. Lift belongs to hover on clickable app cards, overlays, and the device mockup.

## Shapes

`--radius: 0.5rem` (8px); everything derives from it.

| Token                | Value  | Used for                                                  |
| -------------------- | ------ | --------------------------------------------------------- |
| `radius-control` / `lg` | 8px | Inputs, textareas, selects, vote chip, icon tiles, monogram |
| `xl`                 | 11.2px | Menus, selects, popovers (the "12px" class)               |
| `card`               | 20px   | Cards, panels, dialogs, legal card                        |
| pill (`full`, `4xl`) | 9999px / 20.8px | Buttons, chips, nav items, badges, tabs list     |

Borders are 1px `border`; dashed hairline is reserved for empty and upload zones. The MacBook lid is 22px (28px from `sm`).

## Components

### Buttons

- **Base:** `inline-flex items-center justify-center rounded-full border border-transparent text-sm font-semibold whitespace-nowrap transition-all`; press `active:scale-[0.98]`; disabled `opacity-50 pointer-events-none`; icons `size-4`, `gap-2`.
- **Focus:** `focus-visible:ring-3 focus-visible:ring-ring/40` (ochre). Invalid adds `border-destructive ring-destructive/20`.
- **Sizes:** `xs` 28px, `sm` 36px (`px-3.5`), **default 40px** (`px-4`), `lg` 48px (`px-7`, `text-base`).
- **Variants:** `default` `bg-primary text-primary-foreground hover:bg-primary-hover` (one per view); `outline` `border-border-strong bg-background hover:bg-secondary`; `secondary` sand fill; `ghost` transparent, `hover:bg-secondary`; `destructive` outline with red text, `hover:bg-destructive-soft`; `link` `text-primary-text`.

### Inputs and fields

- **Native select:** one global unlayered `select` rule (see the CSS block) swaps the browser arrow for a single 16px chevron, `padding-right: 2.5rem`.

- **Input:** `h-10 w-full rounded-lg border border-input bg-card px-3 py-1`, text 16px on phones and 14px from `md`. Focus `border-ring ring-3 ring-ring/30`. Invalid `border-destructive ring-destructive/20`. Disabled `opacity-50`.
- **Textarea / Select trigger:** same border, radius and focus; select menu is a popover (about 12px, pill items).
- **Field wrapper:** label (14px 500) > optional hint (12px muted) > control > error (14px `destructive`).

### Badges

20px pill (`h-5 px-2 py-0.5 rounded-4xl text-xs font-semibold`). Variants: `default` (primary fill), `secondary` (sand), **`soft`** (`bg-primary-soft text-primary-text`), `outline`, `success` / `warning` / `info`, `destructive`. Data-driven badges pass inline colours from the Tinted Badge Rule. One coloured answer per row.

### Cards

- **`Card`:** `bg-card rounded-card border`, padding 20px (`sm` 16px), footer on `bg-surface` with a top hairline. Dialogs share the 20px radius.
- **Marketing card:** white, hairline, 20px, structure: 36px icon tile (`accent-tint` with `accent-text`, 8px) > title (600) > description (14px muted).
- **Entity card (app):** card plus hover border strengthening to `border-strong`, `shadow-raised` and a 2px rise; whole card is one click target.

### Navigation

- **Marketing header:** `h-16 sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md`; links are pills `px-3.5 py-2` 14px 500, muted with `hover:bg-secondary`, current `bg-primary-soft text-primary-text font-semibold`. Right: `ThemeMenu`, ghost "Log in", primary "Start free".
- **App sidebar:** 240px `bg-sidebar border-r` (desk); items `rounded-full px-3.5 py-2 gap-3 text-sm font-medium` with 16px icons; current is `accent-tint` with ochre semibold, idle muted, hover `bg-secondary`.
- **Public top bar:** white, hairline, a **3px `primary` rule on top**, 56px bar.
- **Theme toggle:** a ghost icon pill that flips light and dark only. Both icons render and swap with `dark:hidden` / `hidden dark:block`.

### Overlays

- **Drawer:** the default place for create, edit and settings; slides from the right over 220ms (180ms out), 20px rounded left edge, `shadow-drawer`; widths 448 / 576 / 768px (`md` / `lg` / `xl`), full width below `sm`. Fixed desk header with a hairline (`px-8 py-6`), Newsreader 24px title, 36px outlined pill close; body `px-8 py-8`; `SheetFooter` is a desk bar with a hairline.
- **Dialog:** centred, 20px, `max-w-md`, `shadow-raised`, Newsreader 20px title, desk footer bar; fades and scales from 97% over 180ms (120ms out). **Menu / select / popover:** `bg-popover rounded-xl p-1`, 100ms fade + zoom-95, pill items, `focus:bg-accent text-accent-foreground`. **Tooltip:** inverted. **Skeleton:** `bg-muted animate-pulse`.

### Marketing composites

- **MacBook mockup (`MacbookMockup`):** CSS laptop: charcoal bezel (`#1b1a1a`, lid 22px / 28px from `sm`), camera notch, aluminium deck (`#c9c5bd`), `device-shadow`. Holds a 2880 by 1800 capture, swapped by theme in CSS (`app-light.png` / `app-dark.png`). Capture a fictional sample board and retake it whenever the app chrome changes.
- **Legal / About shell (`LegalPageShell`):** `desk` ground, `max-w-3xl`, a soft pill badge, Newsreader `h1` (36 to 48px), a muted line, then one white 20px card with a hairline holding all sections (`h2` 16px 600 DM Sans, muted body, ochre underlined links).
- **Section heading:** title (Newsreader) and lead, centred in `max-w-2xl`. **CTA:** white band (`border-t`, `py-20`) or a 20px card.
- **Auth frame:** left (lg only, 58%) a photograph under a flat charcoal scrim (`#353335` at 80%, no gradient, no tint) with white logo, quote and copyright; right is desk with the form at `max-w-sm`.

### Brand mark

The logo (`public/doxa-logo.svg`) and favicon (`src/app/icon.svg`) are filled `#e8b923`, the primary-button amber, identical in light and dark.

### Not-found page

A `surface` wash behind a centred stack: soft "Error 404" pill, a 4, the brand mark as the 0 in a dashed `border-strong` circle, a 4, a heading, a muted line, a filled and an outline pill button. Still, no looping animation.

### Vote chip (signature)

44 x 48px, 8px radius, 1px border, chevron-up over a 13px 600 tabular count. Idle white with hairline; hover moves border and text to `primary-text`; voted is `primary` fill with its foreground, `aria-pressed="true"`; closed is sand and disabled.

## Motion

Motion is feedback: it answers an action and stops.

| Interaction                   | Duration   | Easing                          | Notes                                                    |
| ----------------------------- | ---------- | ------------------------------- | -------------------------------------------------------- |
| Hover / colour transitions    | 150ms      | ease                            | `transition-colors` / `transition-all`                   |
| Button press                  | instant    | n/a                             | `scale(0.98)`                                            |
| Menus, selects, popovers      | 100ms      | ease-out                        | fade + zoom-95                                           |
| Sheet / drawer                | 220ms in, 180ms out | ease-out               | slide-in-from-right; close slides out first              |
| Dialog                        | 180ms in, 120ms out | ease-out               | fade + scale from 97%                                    |
| Vote count roll               | 280ms      | `cubic-bezier(0.16, 1, 0.3, 1)` | 0.9em, clipped in the chip                               |
| First-vote ring               | 520ms      | same expo-out                   | 1px ring expands 10px, fading                            |
| Re-rank glide                 | 380ms      | same expo-out                   | rows that move within ~3s of a vote                      |

**Reduced motion:** a global rule sets animation and transition durations to `0.01ms` and `scroll-behavior: auto`; the vote roll becomes a 200ms in-place fade.

## Accessibility

- WCAG AA target. Ochre on white is about 5.7:1 and charcoal on amber passes AA; field outlines use `control-border` to meet 3:1.
- Focus is always visible: a 3px ring (ochre) at 30-50% alpha plus a `ring` border colour.
- Lists of comparable records are real tables with a caption and `scope="col"`; current nav uses `aria-current`; toggles expose `aria-pressed` / `aria-expanded`.
- Decorative icons are `aria-hidden`; icon-only buttons carry `aria-label`. Touch inputs are 16px below `md`.
- Organisation-supplied colours never reach text or a white-text ground without correction.

## Do's and Don'ts

**Do**

- Use ochre for accent text and focus, charcoal on amber fills, and `accent-tint` plus `sand` for selection and hover.
- Alternate desk and white bands on marketing pages; keep the hero split a hard edge.
- Make every button a pill, inputs 8px, menus about 12px, cards 20px.
- Keep one filled primary per view; repeat actions as `outline`.
- Use a real table for comparable records; put create, edit and settings in the right-hand drawer.
- Pass any third-party colour through the contrast-correcting helpers; keep motion to feedback with a reduced-motion path.
- Provide light and dark only, with a sun/moon toggle in every header.

**Don't**

- Don't use amber as small text, or white on the default amber.
- Don't add a second accent, a gradient, a glow or a system-theme option.
- Don't add `font-bold` to headings; the One Heading Rule overrides it.
- Don't use grey foreground-opacity washes for hover or selection.
- Don't add shadows to rows, chips, badges or resting cards, or lift a selected row; the deep shadow is for the device mockup.
- Don't use solid red for destructive buttons.
- Don't put comparable records in same-size cards on the public surface.
- Don't format dates with locale- or zone-dependent calls.

## Implementing the tokens

### Paste-ready CSS (Tailwind v4 + shadcn variable contract)

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-display);
  --font-display: var(--font-display);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-ink: var(--ink);
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

  --radius-control: 8px;
  --radius-card: 20px;
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  --shadow-card: 0 1px 2px 0 #1010140a, 0 1px 3px 0 #1010140f;
  --shadow-drawer: -12px 0 40px -12px #1b1a1a33;
  --shadow-raised: 0 2px 4px -1px #1010140f, 0 8px 24px -6px #1010141f;
}

:root {
  color-scheme: light;
  --radius: 0.5rem;

  --background: #ffffff;
  --foreground: #353335;
  --ink: #4d4a4d;
  --card: #ffffff;
  --card-foreground: #4d4a4d;
  --popover: #ffffff;
  --popover-foreground: #4d4a4d;

  --primary: #e8b923;
  --primary-foreground: #353335;
  --primary-hover: #d4a615;
  --primary-soft: #faf4df;
  --primary-text: #826400;

  --secondary: #f8f4e4;
  --secondary-foreground: #353335;
  --muted: #f8f4e4;
  --muted-foreground: #6b6b6b;
  --accent: #faf4df;
  --accent-foreground: #826400;

  --destructive: #b3261e;
  --destructive-soft: #fdeceb;
  --success: #146c43;
  --success-soft: #e6f4ec;
  --warning: #8a5a00;
  --warning-soft: #fdf3e0;
  --info: #1f5f9e;
  --info-soft: #ebf3fb;

  --border: #ece5cc;
  --border-strong: #dccfa6;
  --input: #8a7f6e;
  --ring: #826400;

  --surface: #fcfaf3;
  --surface-raised: #ffffff;

  --sidebar: #fcfaf3;
  --sidebar-foreground: #4d4a4d;
  --sidebar-border: #ece5cc;
  --sidebar-primary: #e8b923;
  --sidebar-primary-foreground: #353335;
  --sidebar-accent: #faf4df;
  --sidebar-accent-foreground: #826400;
  --sidebar-ring: #826400;

  --chart-1: #e8b923;
  --chart-2: #826400;
  --chart-3: #146c43;
  --chart-4: #1f5f9e;
  --chart-5: #8a7f6e;
}

.dark {
  color-scheme: dark;
  --background: #141312;
  --foreground: #faf8f2;
  --ink: #e6e2da;
  --card: #1c1b19;
  --card-foreground: #e6e2da;
  --popover: #1c1b19;
  --popover-foreground: #e6e2da;

  --primary: #e8b923;
  --primary-foreground: #353335;
  --primary-hover: #f0c94a;
  --primary-soft: #2a2410;
  --primary-text: #f0c94a;

  --secondary: #262420;
  --secondary-foreground: #faf8f2;
  --muted: #262420;
  --muted-foreground: #a8a399;
  --accent: #2a2410;
  --accent-foreground: #f0c94a;

  --destructive: #ff9d95;
  --destructive-soft: #2e1513;
  --success: #7ee2ab;
  --success-soft: #10281c;
  --warning: #f5c26b;
  --warning-soft: #2b2110;
  --info: #8cc2f5;
  --info-soft: #10202e;

  --border: #2e2b26;
  --border-strong: #433e35;
  --input: #7d7569;
  --ring: #f0c94a;

  --surface: #181716;
  --surface-raised: #1c1b19;

  --sidebar: #181716;
  --sidebar-foreground: #e6e2da;
  --sidebar-border: #2e2b26;
  --sidebar-primary: #e8b923;
  --sidebar-primary-foreground: #353335;
  --sidebar-accent: #2a2410;
  --sidebar-accent-foreground: #f0c94a;
  --sidebar-ring: #f0c94a;

  --chart-2: #f0c94a;
  --chart-3: #7ee2ab;
  --chart-4: #8cc2f5;
  --chart-5: #a8a399;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background;
    color: var(--ink);
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

/* One Heading Rule: unlayered, so it beats the utility layer. */
h1,
h2,
.font-display {
  font-family: var(--font-display), Georgia, serif;
  font-weight: 400;
  font-optical-sizing: auto;
  letter-spacing: -0.02em;
  color: var(--foreground);
}
.font-bold,
.font-extrabold {
  font-weight: 600;
}
h1.font-sans,
h2.font-sans,
.doc-card h2 {
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: normal;
}

.band-desk {
  background: var(--surface);
}

/* Native selects: one custom chevron. Unlayered so it beats px-* utilities. */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
  padding-left: 0.875rem;
}
.dark select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a8a399' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
}

/* The one deep shadow: a picture of a device. */
.device-shadow {
  box-shadow:
    0 2px 4px -1px #1b1a1a14,
    0 40px 80px -24px #1b1a1a40;
}
```

### Theme switching (Next.js)

Light or dark only; there is no system option. Dark is the `dark` class on `<html>`. Store `"light"` or `"dark"` in `localStorage` under `theme` (default light when absent), put `suppressHydrationWarning` on `<html>`, and render a small inline script in `<head>` from the root layout (a Server Component) that adds the class and sets `style.colorScheme` before first paint: `var t=localStorage.getItem("theme");var d=t==="dark";if(d)r.classList.add("dark");r.style.colorScheme=d?"dark":"light"`. A client provider holds the choice and flips it. Don't use `next-themes` 0.4.x with React 19. The switcher is a ghost icon pill (`ThemeMenu`) that renders both a moon and a sun and swaps them with `dark:hidden` / `hidden dark:block`; it sits in the marketing header, app top bar, public top bar and auth pages.

### Fonts (Next.js)

```tsx
import { DM_Sans, Newsreader, Geist_Mono } from "next/font/google";

const dmSans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"], // variable weight with the optical-size axis
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// <html lang="en" className={`${dmSans.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
```

### Component stack

shadcn `base-nova` style on `@base-ui/react`, `class-variance-authority`, `lucide-react`, `sonner`, `tw-animate-css`. Token names are the shadcn contract plus `primary-hover`, `primary-soft`, `primary-text`, `surface`, `surface-raised`, `border-strong` and the `*-soft` semantic grounds.

### Org-led theming

For a product where an end customer supplies a brand colour, re-point the accent tokens at runtime on `:root` (so portalled drawers inherit them), after correcting for contrast:

```ts
// 1. primary: darken the accent in 6% steps toward black until white text on it is >= 4.5:1
// 2. primary-soft: primary mixed 10% into white
// 3. primary-text: primary darkened in 6% steps until it is >= 4.5:1 on primary-soft
// 4. primary-hover: primary mixed 16% toward black
// 5. primary-foreground and sidebar-primary-foreground: #ffffff (the corrected accent is dark enough for white)
// 6. ring, accent, accent-foreground, sidebar-primary, sidebar-ring follow
// badgeColors(c): ground = c at 13% over white; text = c darkened in 6% steps until >= 4.5:1 on the ground
// Invalid or unset input writes nothing, so the default amber (with its charcoal foreground) stands.
```

For dark, the same inputs produce a second set in a `.dark{...}` block written after `:root`: `primary-soft` is the accent mixed into the dark background, `primary-text` is the accent lightened until it reaches 4.5:1 on that tint (also `ring` and `accent-foreground`), `primary-hover` is the accent mixed toward white. Emit the light set as `:root{--primary:...;--primary-foreground:#ffffff;--primary-hover:...;--primary-soft:...;--primary-text:...;--ring:...;--accent:...;--accent-foreground:...}` and validate the input as a six-digit hex first. The masthead tint, text selection, caret and scrollbar all read from `--primary`, so they follow.

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

| Topic                                                         | Location                                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Tokens, dark mode, heading rule, motion, public helpers       | `src/app/globals.css`                                                                                    |
| Fonts, root layout, theme init script                         | `src/app/layout.tsx`, `src/lib/theme.ts`, `src/components/theme-provider.tsx`, `theme-menu.tsx`         |
| Buttons, badges, inputs, cards, dialogs, menus, tabs          | `src/components/ui/*`                                                                                    |
| Marketing components, hero, MacBook, legal shell              | `src/components/marketing/*`, `src/app/(marketing)/_sections/*`, `about/page.tsx`                        |
| Marketing captures                                            | `public/marketing/app-light.png`, `app-dark.png`                                                         |
| App sidebar, page shell, entity cards, drawer                 | `src/components/org-sidebar-nav.tsx`, `page-shell.tsx`, `entity-card.tsx`, `drawer.tsx`                  |
| Auth frame                                                    | `src/app/(auth)/layout.tsx`, `src/components/auth/auth-aside.tsx`                                        |
| Contrast-correcting colour helpers                            | `src/lib/brand-color.ts`, `src/components/public/brand-style.tsx`                                        |
| Public board detail (repo-specific)                           | `DESIGN.md`                                                                                              |
