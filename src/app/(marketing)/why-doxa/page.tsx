import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CTASection } from "@/components/marketing/cta-section";
import { PrioritizationPreview } from "@/components/marketing/product-preview/prioritization-preview";
import { DecisionPreview } from "@/components/marketing/product-preview/decision-preview";

export const metadata: Metadata = {
  title: "Why Doxa",
  description:
    "Feedback isn't the same as decision-making. Votes are useful but incomplete. Doxa closes the loop between input, decision and outcome.",
  alternates: { canonical: "/why-doxa" },
};

export default function WhyDoxaPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Why Doxa"
          title="Feedback is not the same as a decision"
          description="Collecting input is the easy part. Doxa exists for what comes after."
        />

        <div className="mx-auto mt-16 max-w-2xl space-y-6 text-lg">
          <p>
            Votes tell you what people are asking for. They don&apos;t tell you
            whether it&apos;s the right thing to build, who else it affects, or
            what it would cost to do. Votes are useful — they&apos;re just
            incomplete on their own.
          </p>
          <p>
            People who take the time to submit an idea want one thing above all:
            to know whether they were heard. Silence after a suggestion is worse
            than a &quot;no&quot; with a reason.
          </p>
          <p>
            Organisations need context, not just a tally. Evidence, discussion,
            and how a request fits what the team is already trying to do all
            matter as much as the number of votes.
          </p>
          <p>
            A decision that can&apos;t be explained isn&apos;t really a decision
            — it&apos;s a guess with a status label on it. Doxa is built so
            decisions carry their own rationale.
          </p>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Signals inform. People decide.
            </h2>
            <p className="text-muted-foreground mt-3">
              Doxa is designed to combine votes and comments with impact, effort
              and strategic fit — so prioritisation reflects more than who
              shouted loudest.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <PrioritizationPreview />
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <DecisionPreview />
          </div>
          <div className="order-1 flex flex-col justify-center lg:order-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Input → Decision → Outcome
            </h2>
            <p className="text-muted-foreground mt-3">
              Doxa closes the loop: what was asked for, what was decided, why,
              and what happens next — attached to the item itself, not buried in
              a separate tool.
            </p>
          </div>
        </div>
      </div>
      <CTASection
        variant="banner"
        title="See the loop for yourself."
        ctaLabel="Start Free"
        ctaHref="/signup"
        secondaryLabel="Explore features"
        secondaryHref="/features"
      />
    </>
  );
}
