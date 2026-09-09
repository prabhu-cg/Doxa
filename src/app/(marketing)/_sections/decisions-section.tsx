import { SectionHeading } from "@/components/marketing/section-heading";
import { DecisionPreview } from "@/components/marketing/product-preview/decision-preview";

const RECORDED = [
  "What people asked for",
  "What evidence existed",
  "What was decided",
  "Why it was decided",
  "What happens next",
];

export function DecisionsSection() {
  return (
    <section className="bg-secondary border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Decisions"
              title="Don't just collect feedback. Close the loop."
            />
            <p className="text-muted-foreground mt-4 max-w-md">
              Doxa is designed to let teams record a decision alongside the
              item it belongs to:
            </p>
            <ul className="mt-4 space-y-2">
              {RECORDED.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm">
                  <span
                    className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center lg:justify-end">
            <DecisionPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
