import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";

export function SimpleByDefaultSection() {
  return (
    <section className="border-t py-16 sm:py-20">
      <SectionHeading
        eyebrow="Simple by default"
        title="Start simple. Add power when you need it."
        description="Organisations begin with the basics and introduce more structure only when it's actually useful."
      />
      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div className="border-border bg-card flex flex-wrap justify-center gap-2 rounded-xl border p-5">
          {["Collect", "Discuss", "Vote"].map((step) => (
            <Badge key={step}>{step}</Badge>
          ))}
        </div>
        <ArrowRight
          className="text-muted-foreground size-5 shrink-0 rotate-90 sm:rotate-0"
          aria-hidden="true"
        />
        <div className="border-border bg-card flex flex-wrap justify-center gap-2 rounded-xl border p-5">
          {[
            "Prioritisation",
            "Roadmaps",
            "Decisions",
            "Advanced capabilities",
          ].map((step) => (
            <Badge key={step} variant="secondary">
              {step}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
