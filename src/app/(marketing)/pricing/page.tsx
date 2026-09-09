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
import { PRICING_PLANS } from "@/lib/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free. Upgrade when you need more. Doxa's pricing plans, compared.",
  alternates: { canonical: "/pricing" },
};

const COMPARISON_ROWS: {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  business: boolean | string;
}[] = [
  { label: "Organisations", free: "1", pro: "1", business: "Multiple" },
  {
    label: "Members",
    free: "Unlimited",
    pro: "Unlimited",
    business: "Unlimited",
  },
  {
    label: "Feedback, voting & discussion",
    free: true,
    pro: true,
    business: true,
  },
  {
    label: "Prioritisation & roadmaps",
    free: false,
    pro: true,
    business: true,
  },
  { label: "Decision records", free: false, pro: true, business: true },
  { label: "Advanced permissions", free: false, pro: false, business: true },
  { label: "Branding controls", free: false, pro: false, business: true },
  {
    label: "Support",
    free: "Community",
    pro: "Priority",
    business: "Dedicated",
  },
];

const FAQ_ITEMS = [
  {
    question: "Is Doxa really free to start?",
    answer:
      "Yes. You can create an organisation and start collecting feedback on the Free plan with no credit card required.",
  },
  {
    question: "What happens when Pro and Business launch?",
    answer:
      "Pricing for Pro and Business hasn't been finalised yet. Existing Free organisations won't be forced to pay to keep using what they already have.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes — plans are designed so you can upgrade as your organisation's needs grow, without migrating your data.",
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
          description="Final pricing for Pro and Business hasn't been set yet — start on Free today."
        />

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
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
