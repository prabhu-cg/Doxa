---
name: Doxa
description: Listen. Understand. Decide. White paper on a pale butter desk, one amber accent and a serif voice for headlines; public boards are led by the organisation's own identity.
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
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "normal"
  body:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: "normal"
  body-reading:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  caption:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "normal"
  vote-count:
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
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  page-gutter: "32px"
  masthead-y: "32px"
  container-board: "1400px"
  container-app: "1440px"
  container-marketing: "1152px"
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
  input-control:
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
  vote-chip:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.vote-count}"
    rounded: "{rounded.input}"
    width: "44px"
    height: "48px"
  vote-chip-hover:
    textColor: "{colors.accent-text}"
  vote-chip-voted:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  vote-chip-closed:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.ink-muted}"
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
  masthead:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.ink}"
    padding: "32px 32px"
  grid-header-cell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    padding: "10px 12px"
  grid-row-selected:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.ink}"
    padding: "12px"
  nav-item-current:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent-text}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  band-desk:
    backgroundColor: "{colors.desk}"
    textColor: "{colors.ink}"
    padding: "80px 24px"
  org-monogram:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.input}"
    size: "48px"
---

# Design System: Doxa

## Overview

**Creative North Star: "White Paper on a Butter Desk"**

Doxa uses the "Butter" system (the same tokens as the Assessly spec): white paper on a pale butter desk, butter hairlines, one amber accent. Desk (`desk`, #fcfaf3) is chrome: the app sidebar, marketing bands, the auth form ground, the 404 wash, the legal pages. Paper (`background`/`card`, #ffffff) is what people work with: the board grid, cards, forms, the drawer. Amber (`accent`, #e8b923) is a fill that marks what is actionable or selected: the primary button, the voted chip, the monogram tile, the top-bar rule. Amber is never small text; text that carries the accent is ochre (`accent-text`, #826400), which is also the focus colour. Text on amber is charcoal (`on-accent`), never white. Newsreader carries headlines; DM Sans carries everything else.

The public board surface extends that world and is organisation-led: the accent, the mark and the name belong to whichever organisation owns the page (a `BrandStyle` element re-points the accent tokens at runtime, after correcting for contrast), while Doxa's type, spacing and component language stay constant and Doxa's own mark is reduced to one small footer line. Visitors scan, vote and read the team's answer, so the board is a dense, full-width ledger (a real table) opening a `?item=` drawer, not a feed of boxed cards. The unbranded amber page is a designed state, not a fallback.

Two modes share the language. Marketing persuades: desk and white bands alternate, the hero headline carries one ochre phrase, and a CSS MacBook holding real captures of a sample board straddles the desk/white split. The app and boards operate: flat, hairline, tonal. Depth is ground plus 1px hairline; the only deep shadow belongs to the picture of a device.

**Key Characteristics:**

- One amber voice, a fill. Ochre (#826400) when the accent is text. Charcoal on amber. Org-owned on public pages (org accents get white foreground; the Doxa default gets charcoal).
- Newsreader 400 (variable, optical-size axis) for every h1/h2 and `.font-display` (one unlayered rule, so per-page `font-bold` cannot change it); DM Sans for everything else; bold and extra-bold both resolve to 600.
- Paper and desk: white for work, `desk` for chrome, `sand` (#f8f4e4) for hover and secondary tints.
- Shape: every button is a pill; inputs 8px; menus and popovers 12px; cards, panels and dialogs 20px.
- Selection is butter, not grey: selected tab, nav item, row = `accent-tint` with `accent-text`; hover = `sand`.
- Light or dark, nothing else. No system option. A sun/moon pill toggle (`ThemeMenu`) sits in every header; storage key `theme`, default light. Dark is a warm charcoal ramp (#141312 ground, #1c1b19 cards, #181716 desk), never neutral grey.
- Motion is feedback: it answers an action and stops; reduced motion keeps the meaning without the travel.
- The team's decision is first-class content, sitting beside status in the grid.

## Colors

A white-and-butter ledger with one amber accent that any organisation may replace.

### Primary

- **Butter Amber** (`accent`, #e8b923; `--primary`): primary button, voted chip, monogram tile, the 3px rule atop the public top bar, caret, chart fill. Charcoal text on it passes AA.
- **Amber Hover** (`accent-hover`, #d4a615; dark #f0c94a): hover of the fill.
- **Ochre** (`accent-text`, #826400; dark #f0c94a; `--primary-text`, `--accent-foreground`, `--ring`): the only accent allowed as text: links, current nav text, focus ring, hover on the vote chip and row title.
- **Amber Tint** (`accent-tint`, #faf4df; dark #2a2410; `--primary-soft`, `--accent`): the accent as a ground: selected row, current nav item, soft badges, text selection, the masthead base.
- **Charcoal on Amber** (`on-accent`, #353335): text and icons on an amber fill.

### Neutral

- **Paper** (`background`/`card`/`popover`, #ffffff; dark #141312 ground, #1c1b19 cards): grid, top bars, cards, inputs, popovers, the drawer.
- **Desk** (`desk`, `--surface`/`--sidebar`, #fcfaf3; dark #181716): app sidebar and its mobile drawer, marketing desk bands, legal-page ground, auth form ground, 404 wash, item-page aside.
- **Sand** (`sand`, `--secondary`/`--muted`, #f8f4e4; dark #262420): hover wash, secondary tint, disabled and closed states, skeletons.
- **Ink** (`ink`, #4d4a4d; dark #e6e2da): body text. **Ink Strong** (`ink-strong`, `--foreground`, #353335; dark #faf8f2): headings, button labels, vote counts. **Ink Muted** (`ink-muted`, #6b6b6b; dark #a8a399): column headers, meta, placeholders' companions.
- **Hairline** (`hairline`, `--border`, #ece5cc; dark #2e2b26): every border and divider. **Hairline Strong** (`hairline-strong`, #dccfa6; dark #433e35): outline buttons, menus, scrollbar thumb, dashed zones.
- **Control Border** (`control-border`, `--input`, #8a7f6e; dark #7d7569): outlines of text fields, selects and textareas, so field edges meet 3:1.

### Semantic

`success`, `warning`, `info`, `destructive` and their `-soft` grounds are tokens (dark lifts the solids to light values). Destructive actions are an outline button with red text, never a solid red block. The public grid does not use them: decision and status colours come from data.

### Named Rules

**The One Voice Rule.** Amber is the only brand accent and it is a fill. Anything that needs the accent as text uses ochre (`accent-text`); never use the fill colour as small text and never put white on the Doxa default amber. This covers icons and check marks too: on white they use `primary-text` (ochre), and their tinted tiles use `primary-soft`, never `text-primary` or `bg-primary/10`.

**The One Eyebrow Rule.** Every section eyebrow is the same: 14px DM Sans 600, sentence case (never uppercase or letter-spaced), in `primary-text`, set by `SectionHeading`. A page that needs an eyebrow uses that component's styling, not its own.

**The Org-Led Accent Rule.** On public pages never write an amber hex or a fixed amber class. Use `primary`, `primary-hover`, `primary-soft` and `primary-text` so the organisation's accent flows through, including into the portalled drawer. `BrandStyle` writes the variables on `:root` precisely because drawers render outside the page element. Because org accents are darkened until white text passes, `BrandStyle` also sets `--primary-foreground` to white for them; with no organisation colour the Doxa default keeps its charcoal foreground.

**The Corrected Accent Rule.** `brandTokens()` in `src/lib/brand-color.ts` takes the organisation's hex and darkens it in 6% steps toward black until white text on it reaches 4.5:1. `primary-soft` is the corrected accent at 10% over white; `primary-text` is darkened further, again in 6% steps, until it reaches 4.5:1 on that tint; `primary-hover` is the corrected accent 16% toward black. `ring`, `accent` and `accent-foreground` follow, with a separate dark set. Invalid or unset values produce nothing, so the default amber stands. Never render a raw organisation colour as text or as a ground for white text.

**The Tinted Badge Rule.** Any organisation-chosen colour used on a badge (status, decision) goes through `badgeColors()`: the colour at 13% over white as the ground, the colour darkened until it reaches 4.5:1 on that ground as the text. Raw colour on its own tint fails for light hues (amber, grey).

**The One Coloured Answer Rule.** A row shows one coloured answer, not the same word twice. When the team's decision label equals the status name, the decision keeps its colour and the status drops to an outline badge.

**The Masthead Tint Rule.** The masthead ground is 5% of the current `primary` mixed into the page `background` (`.public-masthead`: `color-mix(in oklab, var(--primary) 5%, var(--background))`), never a fixed cream and never a literal white, so it belongs to whichever organisation owns the page and holds in dark mode.

**The Token Only Rule.** No literal brand hex, `bg-white` or hard-coded cream in components; use `primary`, `surface`, `card`, `popover` so dark mode holds.

## Typography

**Display Font:** Newsreader 400, variable with the optical-size axis (`font-optical-sizing: auto`; Georgia fallback)
**Body Font:** DM Sans (ui-sans-serif, system-ui fallback)
**Label/Mono Font:** DM Sans; Geist Mono is loaded app-wide but not used on the public surface.

**Character:** a quiet serif for the headline and a plain humanist sans for the work. Hierarchy comes from the face switch, weight (400, 600, with 500 on controls and nav) and a handful of fixed sizes, never from size inflation. DM Sans has no heavier voice here: `font-bold` and `font-extrabold` render at 600.

### Hierarchy

- **Display** (Newsreader 400, 48px base / 72px from `sm`, line-height 1, -0.02em): the marketing hero `h1`, with one `accent-text` phrase.
- **Headline** (Newsreader 400, 28px, 1.25, -0.02em): the board, roadmap and item-page title; one per page. Marketing section titles and legal-page titles (36 to 48px) are also Newsreader 400.
- **Title** (DM Sans 600, 15px, 1.375): item titles in the grid (two-line clamp) and on the roadmap; org name in the top bar is 15px 600. h3 and card titles are DM Sans 600.
- **Body** (400, 14px): grid cells, controls, drawer copy. Masthead description is 15px at leading 24px, capped at `max-w-prose`. Marketing leads are 18px in `ink-muted`.
- **Reading** (400, 15px, 1.75): the item description in the drawer and item page, capped at `max-w-prose`.
- **Caption** (400, 13px): the one-line grid description (capped 70ch), bylines, the team's reason under a roadmap entry.
- **Label** (600, 12px, sentence case): column headers, badges, meta, timestamps. Drawer section headings are 14px 600.

### Named Rules

**The One Heading Rule.** Every `h1` and `h2` (and `.font-display`) is Newsreader 400 (variable, optical-size axis on) at -0.02em, whatever weight class a page adds, enforced by one unlayered rule in `globals.css` that beats the utility layer. `h1.font-sans`, `h2.font-sans` and `.doc-card h2` opt out to DM Sans 600 with normal tracking (used for sentence-style headings inside the legal card and drawers).

**The Fixed Scale Rule.** Sizes are 12, 13, 14, 15, 16 and 28px in the app and board; marketing steps display sizes by breakpoint. No fluid `clamp()` type.

**The Tabular Numerals Rule.** Votes, comment counts, totals and "n of m" use `tabular-nums`.

**The Sentence Case Rule.** Column headers, badges, nav and buttons are sentence case, not uppercase and not letter-spaced.

## Layout

A single full-width column capped at 1400px on the board, centred (the authenticated app's `PageContainer` is wider, 1440px with the same 16/24/32 gutters, `py-8` and `space-y-6`; `EntityGrid` shows one, two, three and, from `xl`, four cards across), with gutters of 16px (base), 24px (sm) and 32px (lg). The page stacks: a sticky top bar, a masthead (32px vertical padding), then a content band with a 24px top pad and 16px between toolbar and grid, then the footer. Nothing is nested in a card on the board.

The grid is a real `<table>` with `border-separate border-spacing-0`, a screen-reader caption and `scope="col"` headers. Columns, left to right: Votes (72px), Item, Status, Team decision, Type, Tags, Comments, Updated, Submitted by. Progressive disclosure is by breakpoint: below `md` (768px) the header row is visually hidden and status, decision and comment count fold under the title as one badge line; from `md` Status, Team decision, Comments and Updated appear; from `xl` (1280px) Type, Tags and Submitted by appear. Cells are `py-3` with `px-3`; only the vote cell hugs the left edge. Header cells are sticky beneath the top bar (`--public-topbar`, 59px = 3px accent rule + 56px bar) on a white ground.

The toolbar is one row: search (max-w-xs), native selects for type, status, category, tag, a Clear ghost button when filtered, and Sort pushed right. Below `sm` it becomes a two-column grid: search spans both columns, then a **Filters** button beside Sort, with the four selects folded behind it; the button carries an accent count of the filters in force. Filters live in the URL and apply on change (search after a 300ms pause); while a change is on its way the grid steps back to 55% after a 120ms hold.

The item drawer is in the address (`?item=<slug>`): right-hand, full width below `sm` (640px), 768px (`max-w-3xl`, the `xl` drawer size) from `sm`. It opens on the click, not after the server answers (see Item Drawer). The full item page uses two columns (content, then a 22rem sticky aside) from `lg`.

The roadmap uses three stage columns from `md`, 40px apart, each a ruled list, then a divided "Recently shipped" list; below `md` the stages stack. It is not boxed: a stage is a heading over a 2px ink rule, entries separated by hairlines alone.

Marketing: `max-w-6xl` (1152px), 64 to 80px section rhythm, bands alternate `desk` and white separated by `border-t`; the closing CTA is a white band, not an amber one. The hero sits on desk, then a hard split (not a gradient: desk to 30%, white below) behind a MacBook that straddles both. The authenticated app is a 240px desk sidebar beside a white content area.

## Elevation & Depth

Flat and tonal. Surfaces separate by 1px hairline and by ground (white paper, desk, tinted masthead), not by shadow. The selected row is a tint, not a lift. Shadows are reserved for what leaves the page plane: drawers (`shadow-drawer` over a `bg-black/40` scrim, no blur), dialogs (`shadow-raised`), menus and the one picture of a device.

### Shadow Vocabulary

- **Device** (`.device-shadow`: `box-shadow: 0 2px 4px -1px #1b1a1a14, 0 40px 80px -24px #1b1a1a40`): the MacBook mockup only, because it is a picture of a device.
- **Drawer**: `--shadow-drawer` (`-12px 0 40px -12px #1b1a1a33`) on the sheet, a 20px rounded left edge, hairline, over a flat `bg-black/40` scrim.
- **Dialog**: `--shadow-raised`, 20px, `max-w-md`.
- `--shadow-card` and `--shadow-raised` remain defined in the tokens (app entity-card hover); unused on the public surface.

### Named Rules

**The Flat At Rest Rule.** Grid rows, toolbar controls, chips, badges, cards and roadmap entries carry no shadow at rest. Elevation belongs to the drawer, menus and the device mockup. (A first vote's ring is a passing animation, not a resting shadow.)

## Shapes

Pills for every button and chip (text, icon, close, menu items, toggles, tabs list); 8px for inputs, textareas, selects, the vote chip and the monogram tile (`rounded-lg`, from `--radius: 0.5rem`); about 12px for menus, selects and popovers (`rounded-xl`, 11.2px as computed); 20px for cards, panels and dialogs (`rounded-card`). Badges are 20px-high pills. The viewer's initial is a circle. Borders are 1px hairline, dashed only for empty and upload zones. The MacBook mockup is the one device-shaped silhouette (22 to 28px lid radius, charcoal bezel).

## Components

### Buttons

- **Shape:** full pill, DM Sans 600 14px. Shipped sizes: default 40px (`h-10`), `sm` 36px (`h-9`), `lg` 48px (`h-12`), `xs` 28px. The Assessly spec's 44px default is not what shipped.
- **Primary:** amber fill, charcoal text, hover `accent-hover`; used once per view (Submit in the masthead). An empty board repeats Submit as the outline variant, so there is never a second filled button.
- **Outline:** white ground, `hairline-strong` border, hover `sand`. **Ghost:** transparent, `sand` hover. **Secondary:** `sand` fill. **Destructive:** outline with red text, hover `destructive-soft`.
- **Focus / Press:** 3px `ring` (ochre) at 40%; press scales to 0.98.

### Inputs / Fields

- **Style:** 40px tall, 8px radius, white `card` ground, `control-border` outline, 12px side padding, 16px text on touch and 14px from `md`. Focus turns the border ochre with a 3px ring at 30%. The toolbar's native selects and search share the measure.
- **Native select:** one global, unlayered `select` rule removes the browser arrow and draws a single 16px chevron 0.75rem from the right with `padding-right: 2.5rem` (stroke `#6b6b6b` light, `#a8a399` dark), so it beats per-control `px-*` utilities.
- **Error / Disabled:** destructive border with 20% ring; disabled at 50% opacity.
- **Filters toggle (phones):** an outline pill button with `aria-expanded`; when filters are active an accent pill with a tabular count follows the label.

### Vote Chip (signature)

- **Shape:** 44 by 48px, 8px radius, 1px border, chevron-up over a tabular count (13px, 600). First cell of every row and repeated as a button in the drawer.
- **States:** idle is white with a hairline border and turns to accent border and `primary-text` on hover; voted is a `primary` fill with its foreground (charcoal on Doxa amber, white on an org accent), `aria-pressed=true`; signed-out it is a link to sign in that returns to the board; closed (unconfirmed email, blocked) is sand, disabled, with the reason as its title. Voting is optimistic and reverts with a toast on failure.
- **Motion:** the count rolls one notch the way it moved (280ms, exponential ease-out, clipped inside the chip), and a first vote sends one accent ring 10px outward over 520ms. Neither plays on page load. Under reduced motion the roll becomes a 200ms fade and the ring is dropped.

### Data Grid Row

- **Style:** hairline bottom border, hover `sand` at 60%, whole row clickable except inner links and controls. A plain click opens the drawer at once; middle- and cmd/ctrl-click open a new tab. The title is a real link.
- **Selected:** `aria-current="true"` with an `accent-tint` fill while its drawer is open or opening.
- **Re-ranking:** sorted by "Most voted", a row that moves within about 3 seconds of a vote glides to its new rank (380ms, exponential ease-out). Other moves simply appear.

### Badges

- **Style:** 20px pill, 12px 600. Variants: soft (`accent-tint` with ochre), outline (hairline, ink-strong text), secondary (sand), plus success, warning, info, destructive. Status and decision badges take their colour from organisation data and always pass through `badgeColors()`.
- **Decision:** "Planned", "In progress", "Completed", "Declined", "Deferred", "Duplicate"; shown bare in the grid and drawer facts, "Decision: Label" elsewhere.

### Cards / Containers

- **Corner Style:** 20px (`rounded-card`), 1px hairline border, white `card` ground, 20px padding (16px `sm`); footer on `surface` with a top hairline. Dialogs share the 20px radius.
- **Depth:** flat at rest; clickable entity cards in the app lift on hover (see Elevation). Not used for lists of comparable records on the public surface.

### Navigation

- **Marketing header:** sticky, white at 90% with blur and a hairline; links are pills (`px-3.5 py-2`, 14px 500); current is `accent-tint` with ochre semibold; others are ink-muted with a `sand` hover. Right side: `ThemeMenu`, ghost "Log in", primary "Start free".
- **Theme toggle (`ThemeMenu`):** a ghost icon pill, moon in light and sun in dark (both rendered, swapped by the `dark` class), flips between exactly two states. Key `theme`, default light, set before paint by an inline script. Present in the marketing header, app top bar, public top bar and auth pages.
- **App sidebar:** `desk` ground with a hairline right edge. Items are pills (`rounded-full px-3.5 py-2`, 14px 500, 16px icon). Current is `accent-tint` with ochre semibold; idle is ink-muted; hover is `sand` with ink-strong text.
- **Public top bar:** white, hairline bottom, sticky. A 3px `primary` rule sits above a 56px bar: org identity left (30px mark), tabs, viewer menu right. On masthead pages the top bar shows only the org name.
- **Public tabs:** 14px 600, current `primary-soft` with `primary-text`, others ink-muted with a hover wash. Shipped at `rounded-md` (about 6px) rather than a pill; that is incumbent drift from the pill rule, recorded here as built, not as a rule for new nav.

### Masthead

The page's head, at the Masthead Tint. The org mark (48px) beside the 28px Newsreader title, then the description, then one line of live facts with bold tabular numbers. The Submit primary sits at the right, bottom-aligned. The roadmap masthead has the same shape.

### Org Identity and Monogram

The logo (`max-w-9rem`) when the org has one; otherwise a monogram tile: up to two initials, 600, on `primary` in its foreground colour, 8px radius, font size 40% of the tile. Doxa's own mark (`public/doxa-logo.svg` and the favicon `src/app/icon.svg`) is filled `#e8b923`, the primary-button amber, in both themes. A logo wider than 2.2:1 is a wordmark and the name is dropped beside it. 30px in the top bar, 48px in the masthead.

### Item Drawer

A right-hand sheet with a fixed header over a scrolling body. Header: title (Newsreader 24px, clamped to four lines) with "Open page" and close; status and, when it differs, the team's decision; type and board; byline. Body: **Details** (description at Reading size, tags), the team's decision as a tinted panel, vote and follow actions, a hairline, the discussion. **It opens on the click**: the host stays mounted while the address changes, so the panel slides in at once with the title the row already has and `Skeleton` lines for the rest, which the server render replaces. It slides in from the right over 220ms (keyframe `data-open:animate-in`; 180ms out) with the scrim fading in over 180ms; closing slides out first, then removes `?item`. Comment times are relative; decision dates use `formatDate` (en-GB, UTC).

### Roadmap

Three stages (Now, Next, Later), each headed by its name and a tabular count over a 2px ink rule. An entry is a 15px 600 title link (ochre and underlined on hover), the team's reason in up to three lines of 13px muted, then a 12px meta line: outline type badge, "n votes", "target 3 Oct 2026". "Recently shipped" is a divided list under a matching rule. A list of the team's answers, not a board of same-size cards.

### Empty States

A dashed hairline panel, centred, 64px vertical padding: a 14px 600 statement, one line of muted copy at most `max-w-sm`, then the single next action. An empty board offers the outline Submit; a filtered board says "No ideas match" with "Clear filters" as a text link.

### Marketing Hero and MacBook

The hero is desk-grounded: a soft badge, a Newsreader display `h1` with one `text-primary-text` (ochre) phrase, a muted lead, a `lg` primary and a `lg` outline pill. Beneath, `MacbookMockup` (a CSS laptop: charcoal bezel, notch, aluminium deck, `device-shadow`) straddles the desk/white split holding real captures, `public/marketing/app-light.png` and `app-dark.png` (2880 by 1800, swapped by theme in CSS), of a fictional "Northwind" sample board. The caption says "Sample board with example data." Retake the captures whenever the board chrome changes.

### Legal and About Pages

About, Privacy and Terms share `LegalPageShell`: `desk` ground, `max-w-3xl`, a soft pill badge, a Newsreader `h1` (36 to 48px), an optional subtitle or "Last updated" line, then the whole document in one white 20px card with a hairline: section `h2`s in DM Sans 16px 600 (via `font-sans`), muted body, ochre underlined links.

### Auth Panel

On sign-in and sign-up, Doxa's left panel (from `lg`, 58% wide) is a photograph under a flat charcoal scrim (`#353335` at 80%, no gradient, no tint) so the white logo, quote and copyright stay readable. The form side is desk. It steps aside entirely when the sign-in belongs to an organisation, which leads with its own mark, name and accent.

### Not Found

The app-wide 404 on a `surface` wash: a soft "Error 404" pill, a 4, Doxa's mark in a dashed `hairline-strong` halo as the 0, and a 4, then "This page didn't get a reply.", one line of muted copy, a filled and an outline button, and the failed address in a soft code chip. Still, no looping animation.

### Footer (public)

One hairline-topped row, 12px muted: the org name left, "Powered by [Doxa mark] Doxa" right. The only place Doxa's identity appears on a public page.

## Do's and Don'ts

### Do:

- **Do** take every accent colour on public pages from `primary`, `primary-hover`, `primary-soft` and `primary-text`, and pass any organisation colour through `brandTokens()` or `badgeColors()` before it touches text.
- **Do** use ochre (#826400) for accent text and focus, charcoal (#353335) on amber fills, white only on corrected org accents.
- **Do** alternate `desk` and white bands on marketing pages, separated by `border-t`.
- **Do** keep every button a pill, inputs 8px, menus about 12px, cards 20px; mark selection with `accent-tint` and hover with `sand`.
- **Do** keep the vote first in the row and repeat it in the drawer; sign-in returns the visitor to where they were.
- **Do** build lists of comparable records as a real table with a caption, `scope="col"` headers and `aria-sort` on sortable headers, and disclose columns by breakpoint (`md`, `xl`).
- **Do** put new detail views in the `?item=` drawer pattern (768px, `xl` size; full width below `sm`) and open them on the click with what is already known.
- **Do** open create, edit and settings flows as a right-hand drawer (the shared `Drawer` in `src/components/drawer.tsx`).
- **Do** use the organisation's own word for an item (`terminology`) in headers, captions, buttons and empty states.
- **Do** keep motion to feedback, 150 to 380ms with exponential ease-out, with a reduced-motion path that keeps the meaning.
- **Do** use `formatDate` for absolute dates and `formatRelativeTime` for activity; `tabular-nums` on every count.
- **Do** retake `public/marketing/app-*.png` when the board chrome changes, and label them as sample data.
- **Do** design the unbranded state (amber, monogram tile) as the finished page.

### Don't:

- **Don't** hard-code amber or any organisation colour on `/b` and `/r`, and don't set an accent on `:root` from anywhere except `BrandStyle`.
- **Don't** use amber as small text, or white on the Doxa default amber.
- **Don't** put an organisation's raw colour behind white text or use it as small text without correction.
- **Don't** add a system theme option; the theme is light or dark.
- **Don't** use grey foreground-opacity washes for hover or selection; use `sand` and `accent-tint`.
- **Don't** add a second accent, a gradient or glow; the desk-to-white hero split is a hard edge.
- **Don't** add `font-bold` to a heading to change it; the One Heading Rule overrides it.
- **Don't** show the same word twice in two coloured badges on one row.
- **Don't** repeat Doxa's logo or name on a public page beyond the single footer line.
- **Don't** format dates with `toLocaleDateString` or any locale- or zone-dependent call.
- **Don't** add shadows to grid rows, chips, badges or resting cards, and don't lift the selected row; tint it. The deep shadow is for the device mockup only.
- **Don't** fly or morph an element from a row into the drawer; the drawer slides in and the row keeps its place.
- **Don't** put roadmap entries, or any list of comparable records, in same-size cards.
- **Don't** add a second filled primary button to a view; a repeated action is outline.

## Drawers and Dialogs

Every create, edit and settings surface is a right-hand **drawer** (shared `Drawer`, `src/components/drawer.tsx`); only destructive confirmations interrupt, as a centred **dialog**. Both put chrome on the desk ground and content on paper, with hairlines between.

- **Drawer:** 448px by default, 576px (`lg`), 768px (`xl`); full width below `sm`. Header on desk with a hairline beneath (`px-8 py-6`), title in Newsreader 24px (at most two lines), 14px muted description, a 36px outlined pill close. Body on paper, `px-8 py-8`. `SheetFooter` is a desk bar with a hairline: Cancel left of one primary on the right.
- **Dialog:** 20px, `max-w-md`, Newsreader 20px title, 14px muted description, footer bar on desk with a hairline holding Cancel (outline) and the action (destructive is outline with red text).
- **Motion:** drawer slides in over 220ms and out over 180ms, scrim fades 180ms in and 150ms out; dialog fades and scales from 97% over 180ms and out over 120ms. Reduced motion drops the travel.

The drawer panel takes focus itself when it opens, so it carries `outline-none` (no focus ring around the sheet); the controls inside keep their own focus rings.
