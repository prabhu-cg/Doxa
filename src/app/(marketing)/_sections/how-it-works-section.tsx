import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

const FLOW = [
  "Community",
  "Input",
  "Discussion",
  "Signals",
  "Prioritisation",
  "Decision",
  "Communication",
];

export function HowItWorksSection() {
  return (
    <section className="bg-secondary border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="How it works"
          title="From community to communication"
        />
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-y-3">
          {FLOW.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="border-border bg-card rounded-full border px-5 py-2.5 text-sm font-medium">
                {step}
              </div>
              {index < FLOW.length - 1 ? (
                <ArrowRight
                  className="text-muted-foreground mx-2 size-4 shrink-0"
                  aria-hidden="true"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
