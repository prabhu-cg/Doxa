import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Doxa exists: organisations receive more input than ever, but collecting it is only the beginning.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeading eyebrow="About" title="Why Doxa exists" />
      <div className="mx-auto mt-10 max-w-2xl space-y-6 text-lg">
        <p>
          Organisations receive more input than ever — from customers,
          employees, and the communities they serve. Collecting that input is
          only the beginning. The difficult part is turning it into useful
          decisions.
        </p>
        <p>
          Most tools stop at collection: a list of requests, a vote count, a
          status that changes without explanation. Doxa is built around the rest
          of the loop — understanding what matters, prioritising with real
          signals, deciding explicitly, and telling people what happened.
        </p>
        <p>
          Doxa is intentionally generic. The core object is an Item, not a
          &quot;feature request&quot; — because a product team, a customer
          community, an internal team, and a public organisation all have input
          worth collecting, in their own words.
        </p>
      </div>
      <div className="mt-16">
        <CTASection title="Start collecting input today." />
      </div>
    </div>
  );
}
