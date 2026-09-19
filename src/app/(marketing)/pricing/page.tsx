import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PricingCard } from "@/components/marketing/pricing-card";
import { FAQ } from "@/components/marketing/faq";
import { CTASection } from "@/components/marketing/cta-section";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CHECKOUT_LIVE,
  PRICING_PLANS,
  formatLimit,
  planByKey,
} from "@/lib/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free. Upgrade when you need more. Doxa's pricing plans, compared.",
  alternates: { canonical: "/pricing" },
};

type Row = {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  business: boolean | string;
};

const FREE = planByKey("FREE");
const PRO = planByKey("PRO");
const BUSINESS = planByKey("BUSINESS");

/** A limit that comes straight from the plan data, so this table can't drift
 * from what the app enforces. */
const limitRow = (
  label: string,
  pick: (plan: typeof FREE) => number | null,
): Row => ({
  label,
  free: formatLimit(pick(FREE)),
  pro: formatLimit(pick(PRO)),
  business: formatLimit(pick(BUSINESS)),
});

const COMPARISON_ROWS: Row[] = [
  limitRow("Organisations", (p) => p.maxOrganizations),
  limitRow("Team members", (p) => p.maxMembers),
  limitRow("Boards", (p) => p.maxBoards),
  limitRow("Items created by your team", (p) => p.maxItems),
  {
    label: "Feedback, voting & discussion",
    free: true,
    pro: true,
    business: true,
  },
  {
    label: "Decision records, with public reasons",
    free: true,
    pro: true,
    business: true,
  },
  {
    label: "Public boards & public roadmap",
    free: true,
    pro: true,
    business: true,
  },
  {
    label: "Cross-board prioritisation",
    free: FREE.advancedPrioritisation,
    pro: PRO.advancedPrioritisation,
    business: BUSINESS.advancedPrioritisation,
  },
  {
    label: "Your logo & accent colour on public pages",
    free: FREE.branding,
    pro: PRO.branding,
    business: BUSINESS.branding,
  },
];

const FAQ_ITEMS = [
  {
    question: "Is Doxa really free to start?",
    answer:
      "Yes. You can create an organisation and start collecting feedback on the Free plan with no credit card required.",
  },
  {
    question: "What counts toward my plan's limits?",
    answer:
      "Your team: its members, its boards, and the items your team creates. Doxa never charges per voter, commenter or contributor, so how many people give you feedback doesn't change your bill.",
  },
  {
    question: CHECKOUT_LIVE
      ? "How do I upgrade?"
      : "Can I pay for Pro or Business yet?",
    answer: CHECKOUT_LIVE
      ? "Open your organisation's billing settings and choose a plan. You can change or cancel at any time."
      : "Not yet. Pro and Business are priced, but paid checkout isn't open, so every organisation starts on Free. We'll announce when it opens, and Free organisations won't be forced to pay to keep what they already have.",
  },
  {
    question: "Do you offer discounts for non-profits or communities?",
    answer:
      "We don't have a program to announce yet. Reach out on the contact page and we'll factor your use case into pricing as it's finalised.",
  },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span>{value}</span>;
  return value ? (
    <Check className="text-primary mx-auto size-4" aria-label="Included" />
  ) : (
    <Minus
      className="text-muted-foreground/50 mx-auto size-4"
      aria-label="Not included"
    />
  );
}

export default function PricingPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }}
        />
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Upgrade when you need more."
          description="Priced per team, never per voter. Start on Free today."
        />

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Priced per team, never per voter
          </h2>
          <p className="text-muted-foreground mt-3">
            Your plan depends on your team: its members, its boards, and the
            items it creates. It never depends on how many people vote, comment
            or contribute, so getting more feedback never raises your bill.
          </p>
        </div>

        <div className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Compare plans
          </h2>
          <div className="mt-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-center">Free</TableHead>
                  <TableHead className="text-center">Pro</TableHead>
                  <TableHead className="text-center">Business</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-center">
                      <ComparisonCell value={row.free} />
                    </TableCell>
                    <TableCell className="text-center">
                      <ComparisonCell value={row.pro} />
                    </TableCell>
                    <TableCell className="text-center">
                      <ComparisonCell value={row.business} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-8">
            <FAQ items={FAQ_ITEMS} />
          </div>
        </div>
      </div>
      <CTASection
        variant="banner"
        title="Start free today."
        ctaLabel="Start Free"
        ctaHref="/signup"
      />
    </>
  );
}
