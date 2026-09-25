---
version: 1
slug: "src-app-b"
primary_target: "src/app/b"
related_targets: ["src/app/r","src/components/public"]
---

# Public board surface (/b/[orgSlug]/[boardSlug], item page, roadmap shell)

Mode: Operate (visitors browse, scan, vote, and read the team's answer). Extension of an established world: Doxa's terracotta/cream/Manrope system, org-led per PRODUCT.md. No concept roll: the structure (data grid + right-hand drawer) was specified by the user, so this is shaped directly.

Audience and job: an organisation's customers scan what others asked for, vote in one click, open an item to read the team's decision and discuss. The team wants its brand on the page and its answers visible.

Constraints: works with no logo and no accent colour (Free plan); external logo URLs may fail; accent colours must be contrast-corrected; nothing internal ever shown; keyboard and screen-reader operable; the drawer must be part of the address (shareable, refresh-safe) — it is the board's own `?item=<slug>`, because Next's intercepting-route marker cannot sit on a dynamic segment.

## Direction contract

THESIS: The public board is a working ledger, not a card feed: one dense, full-width table where the vote is the first thing in every row and the team's decision sits beside the status. It refuses the centred narrow column of stacked cards.

OWN-WORLD: Doxa's warm world made org-led. Accent-tinted masthead over white grid, warm hairline borders, Manrope with tabular numerals, the organisation's accent (contrast-corrected, terracotta when unset) reserved for the primary action, the voted state, the selected row, links and focus. Org mark is the logo or a monogram tile in the accent, small in the top bar and 48px at the head of the masthead; Doxa appears once, small, in the footer. The masthead ground is a 5% tint of the accent over the page background (`.public-masthead`), not a fixed cream or a literal white.

STORY: A visitor understands whose board this is, how the team responds, and what people want within a glance; they vote without leaving the list, open any row to read the decision and its reason, and sign in only at the moment they act, returning exactly where they were.

FIRST VIEWPORT: 1440px: a 56px top bar (org mark + name left, Feedback / Roadmap tabs, sign-in or account right), a masthead tinted 5% with the accent, the org mark at 48px beside the board name at 28px, description, one sentence of live facts, and the Submit primary at the right; below it a single toolbar row (search, type, status, category, tag, sort) and the grid header with the first rows already visible, full content width. Nothing is boxed in cards. On a phone the filters fold behind one Filters button beside the sort, so the first row is on screen without scrolling. A click on a row opens its drawer at once; the server fills it in.

FORM: Data grid plus a query-parameter drawer (`?item=`) inside the established world (position 1 of 1: user-specified structure; no roll, no seed key).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
