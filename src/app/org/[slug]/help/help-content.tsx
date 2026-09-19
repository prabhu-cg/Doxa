import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Term = { name: string; definition: string };

const TERMS: Term[] = [
  {
    name: "Organisation",
    definition:
      "The top-level account everything else belongs to — your team or company. Every person, Space, Board, and Item exists inside exactly one Organisation. Membership has a role (Owner, Admin, or Member) that controls what you can configure.",
  },
  {
    name: "Space",
    definition:
      'A logical grouping of Boards — e.g. "Product" or "Customer Support". Spaces exist to keep related Boards together as an Organisation grows past just one or two; a brand-new Organisation typically has a single Space to start.',
  },
  {
    name: "Board",
    definition:
      'Where Items are actually submitted and browsed, inside a Space. A Board is Public (anyone with the link can browse, no account required) or Private (organisation members only). Think of a Board as one specific area of feedback — "Mobile bugs" and "Feature requests" would usually be two different Boards, not one.',
  },
  {
    name: "Item",
    definition:
      'The core object submitted to a Board — a feature request, bug, idea, or whatever your Organisation calls it (see "Terminology" in Branding settings; an Item might display as "Ticket" or "Request" instead). Every Item has a type, a status, a priority, and its own page with votes, comments, followers, and activity.',
  },
  {
    name: "Item type",
    definition:
      "A configurable category for what kind of thing an Item is — Feature, Bug, Idea, Improvement, and so on. Types are defined per Organisation, not fixed by Doxa, so you can rename, add, or archive them under Content configuration.",
  },
  {
    name: "Status",
    definition:
      'The workflow stage an Item is in — Open, Planned, In Progress, Completed, Declined, or whatever your Organisation defines. One status is marked "Default" and is what a newly submitted Item starts at.',
  },
  {
    name: "Category / Tag",
    definition:
      "Two lighter-weight ways to classify an Item. Category is single-select (an Item has at most one); Tags are multi-select free-form labels. Both are optional and organisation-defined.",
  },
  {
    name: "Priority",
    definition:
      'How urgent or important an Item is, set explicitly by an admin — None, Low, Medium, High, or Critical by default. Priority is never inferred from vote count: a heavily-voted Item is still "None" priority until someone deliberately sets it, because votes are evidence, not a decision.',
  },
  {
    name: "Community signal",
    definition:
      "What the people using your product tell you directly — votes, comments, and followers on an Item. This is input, not an automatic verdict: high community signal is a strong reason to look at something, not a decision by itself.",
  },
  {
    name: "Business signal / Scoring",
    definition:
      "How your Organisation evaluates an Item internally, on whatever dimensions you configure (Customer impact, Effort, Strategic alignment, ...) under Content configuration → Scoring. Each configured criterion is scored 1–5 on an Item; Doxa combines them into one weighted score so you can compare Items scored on different dimensions.",
  },
  {
    name: "Decision",
    definition:
      'The actual, recorded outcome for an Item — what was decided and why. A Decision has a type (Planned, In Progress, Completed, Declined, Deferred, Duplicate) and a required rationale. Recording a new Decision never erases the old one: every past Decision stays visible in an Item\'s history, so "what did we decide, and why" is always answerable later.',
  },
  {
    name: "Roadmap",
    definition:
      "A simple Now / Next / Later view, populated only when a Decision explicitly places an Item there. An Item never lands on the Roadmap just because it has votes — someone has to have decided it belongs there.",
  },
  {
    name: "Prioritisation view",
    definition:
      'The internal, admin-only working view that answers "what should we look at next?" across every Board at once — sortable by votes, priority, status, type, category, and score, with community and business signal always shown side by side rather than collapsed into one number. Requires the Pro plan or higher.',
  },
  {
    name: "Plan",
    definition:
      "Your Organisation's commercial tier — Free, Pro, or Business — which controls limits (members, boards, Items) and which features are available (advanced prioritisation, analytics, custom branding, integrations). Managed under Settings → Billing.",
  },
  {
    name: "Role",
    definition:
      "What a member can do within an Organisation. Member can submit, vote, comment, and follow. Admin can additionally manage Boards, Spaces, content configuration, and moderate members. Owner can additionally manage billing and remove/promote another Owner. Every Organisation needs at least one Owner.",
  },
  {
    name: "Audit log",
    definition:
      "An append-only record of significant administrative and security events for your Organisation — members added or removed, roles changed, settings or branding updated, Boards created, Decisions recorded, and plan changes. Visible to admins and owners under Settings.",
  },
  {
    name: "Branding",
    definition:
      'Your Organisation\'s visual identity — logo, accent colour, and what you call an Item (e.g. "Ticket" instead of "Item"). A custom logo and accent colour require the Pro plan or higher; naming what an Item is called is free on every plan.',
  },
];

/** The Help body, shared by the full page (`help/page.tsx`) and the drawer
 * that intercepts it (`@modal/(.)help/page.tsx`). */
export function HelpContent() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold">The core loop</h2>
          <p className="text-muted-foreground text-sm">
            Doxa&apos;s whole point is one loop:{" "}
            <span className="text-foreground font-medium">
              Collect → Discuss → Understand → Prioritise → Decide →
              Communicate.
            </span>{" "}
            People submit Items to a Board and discuss them there (Collect,
            Discuss). Votes, comments, and scoring give you evidence about what
            matters (Understand, Prioritise). An admin records an explicit
            Decision with a stated reason (Decide). That Decision — not the vote
            count — is what shows up on the Roadmap and on the public Board,
            closing the loop back to whoever asked (Communicate).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold">
            The most important idea in Doxa
          </h2>
          <p className="text-muted-foreground text-sm">
            <Badge variant="secondary" className="mr-1.5">
              Opinions are evidence, not decisions
            </Badge>
            A hundred votes on an Item is a strong signal — it is never, by
            itself, a priority or a decision. Priority is something an admin
            sets. A Decision is something an admin records, with a reason. The
            Roadmap only shows Items someone has actually decided belong there.
            This separation is deliberate: it keeps &quot;people want this&quot;
            and &quot;we&apos;re doing this&quot; from getting confused with
            each other.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Terminology</h2>
        <Accordion>
          {TERMS.map((term) => (
            <AccordionItem key={term.name} value={term.name}>
              <AccordionTrigger>{term.name}</AccordionTrigger>
              <AccordionContent>{term.definition}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
