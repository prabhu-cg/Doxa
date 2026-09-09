import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

const START_WITH = ["Collect", "Discuss", "Vote"];
const ADD_LATER = [
  "Prioritisation",
  "Roadmaps",
  "Decisions",
  "Advanced capabilities",
];

function StepList({
  label,
  items,
  emphasis,
}: {
  label: string;
  items: string[];
  emphasis?: boolean;
}) {
  return (
    <div className="border-border bg-card w-full max-w-xs rounded-xl border p-6">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm">
            <span
              className={
                emphasis
                  ? "bg-primary size-1.5 shrink-0 rounded-full"
                  : "bg-muted-foreground/40 size-1.5 shrink-0 rounded-full"
              }
              aria-hidden="true"
            />
            <span className={emphasis ? "font-medium" : ""}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SimpleByDefaultSection() {
  return (
    <section className="bg-background border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Simple by default"
          title="Start simple. Add power when you need it."
          description="Organisations begin with the basics and introduce more structure only when it's actually useful."
        />
        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:justify-center">
          <StepList label="Start with" items={START_WITH} emphasis />
          <ArrowRight
            className="text-muted-foreground size-5 shrink-0 rotate-90 sm:mt-24 sm:rotate-0"
            aria-hidden="true"
          />
          <StepList label="Add when ready" items={ADD_LATER} />
        </div>
      </div>
    </section>
  );
}
