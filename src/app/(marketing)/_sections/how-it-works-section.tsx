import { ArrowDown } from "lucide-react";
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
    <section className="border-t py-16 sm:py-20">
      <SectionHeading
        eyebrow="How it works"
        title="From community to communication"
      />
      <div className="mx-auto mt-10 flex max-w-xs flex-col items-center">
        {FLOW.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <div className="border-border bg-card w-full rounded-lg border px-5 py-3 text-center text-sm font-medium">
              {step}
            </div>
            {index < FLOW.length - 1 ? (
              <ArrowDown
                className="text-muted-foreground my-2 size-4"
                aria-hidden="true"
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
