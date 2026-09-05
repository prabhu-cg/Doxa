import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";

const SIGNALS = [
  "Votes",
  "Comments",
  "Demand",
  "Impact",
  "Business value",
  "Effort",
  "Strategic alignment",
  "Priority",
  "Decision rationale",
];

export function DifferentiationSection() {
  return (
    <section className="border-t py-16 sm:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <SectionHeading
          align="left"
          eyebrow="Not just a voting board"
          title="Votes are a signal, not a decision."
          description="A popularity contest doesn't tell you what to build. Doxa is designed to bring votes and comments together with the other things that actually go into a decision."
        />
        <div className="flex flex-wrap gap-2">
          {SIGNALS.map((signal) => (
            <Badge
              key={signal}
              variant="secondary"
              className="px-3 py-1 text-sm"
            >
              {signal}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
