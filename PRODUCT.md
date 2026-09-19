# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **The team** (owners, admins, members of an organisation): collects feedback, prioritises it, records decisions with reasons. They set up boards, review submissions, and brand the public page.
- **The community**: an organisation's customers or end users, and sometimes its own staff, who arrive at a public board link. They are ordinary end users, so sign-in has to be low-friction. They browse what others asked for, vote, comment, follow and submit their own. They are not Doxa users in any other sense and may never see Doxa's own site.
- The product is for any organisation and any use case (product feedback, internal requests, ideas). It must not be locked to one niche or vertical.

## Product Purpose

Doxa is a community feedback, prioritisation and decision platform: Collect → Discuss → Understand → Prioritise → Decide → Communicate. Gathering feedback from real users is the main purpose; without a usable public board there is no use for the tool. Success is customers taking part, and the team visibly answering them.

## Positioning

Opinions are evidence, not automatically decisions. Every item can end in a public decision plus the reason. The public board shows the team's decision and rationale, how often the team responds, and a public roadmap. Pricing is per team, so the number of people giving feedback never raises anyone's bill. A neighbouring feedback tool (Canny, UserVoice) would not truthfully copy the decision-transparency stance or the flat, community-friendly pricing.

## Operating Context

- The public board is `/b/[orgSlug]/[boardSlug]`; an item is `/b/…/[itemSlug]`; the organisation's public roadmap is `/r/[orgSlug]`. Boards are Public or Private; only Public, active boards have public pages.
- A visitor may be signed out (read only), signed in with a confirmed email (vote, comment, follow, submit), unconfirmed, or blocked. Submissions can wait for team review (per-board setting, on by default) and are then visible only to the team and their author.
- Item terminology is per organisation (an item may be called Idea, Ticket, Request…). Item types, statuses, categories and tags are per-organisation data.
- Each item carries: title, description, type, status, current decision (Planned, In progress, Completed, Declined, Deferred, Duplicate) with a public rationale and history, vote and comment counts, tags, category, author, dates.

## Capabilities and Constraints

- Organisation branding exists as data: `Organization.logoUrl` (an external URL) and `Organization.accentColor`. Setting either is gated by the Pro plan's `branding` entitlement; Free organisations have neither, so the public page must look complete with no logo and no accent colour.
- Doxa's own identity is fixed: terracotta `#c74504` speech-bubble mark (`/doxa-logo.svg`), warm cream neutrals, Manrope. There is no dark-mode requirement recorded; the app supports both.
- Public pages are server-rendered and dynamic (they read the visitor's session). Filters are plain GET forms today; the board can hold hundreds of items.
- No email delivery exists yet, so a participant has no notification surface.
- Undecided: whether "Powered by Doxa" becomes removable on paid plans (the user chose the org-led, Doxa-in-the-footer option without removability for now).

## Brand Commitments

- **The organisation's identity leads the public page** (confirmed): its logo or a generated monogram, name and accent colour in the masthead, with a small, quiet "Powered by Doxa" mark. The page should still feel unmistakably crafted by Doxa: its typography, spacing and component language stay.
- Doxa's tagline: "Listen. Understand. Decide."

## Evidence on Hand

- Real content and data come from the database; there are no invented testimonials or customer logos, and none may be fabricated.
- `/doxa-logo.svg` and the `DoxaLogo` component are the only shipped brand assets. No organisation has an uploaded logo file; `logoUrl` is a pasted URL.

## Product Principles

1. The team's answer is part of the page: decisions and their reasons are visible, not buried.
2. Taking part must cost as little as possible: one click to vote, sign-in that returns you where you were.
3. A visitor sees the organisation's community, not Doxa's admin: nothing internal (notes, who decided, private boards) ever appears.
4. Works for any organisation with nothing configured: the unbranded page is a designed state, not a fallback.
5. Honest by default: no counts or claims the data doesn't support.

## Accessibility & Inclusion

- The public audience is unknown and broad: keyboard operable, screen-reader labelled, WCAG AA contrast including on organisation-chosen accent colours (the page must correct or fall back when an accent fails contrast).
