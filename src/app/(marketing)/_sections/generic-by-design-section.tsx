import {
  Boxes,
  Users,
  Lightbulb,
  Wrench,
  Landmark,
  Settings2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

const EXAMPLES: { icon: LucideIcon; label: string }[] = [
  { icon: Boxes, label: "Product feedback" },
  { icon: Users, label: "Customer suggestions" },
  { icon: Lightbulb, label: "Internal ideas" },
  { icon: Wrench, label: "IT requests" },
  { icon: Landmark, label: "Community proposals" },
  { icon: Settings2, label: "Service improvements" },
];

export function GenericByDesignSection() {
  return (
    <section className="bg-secondary border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Generic by design"
          title="Not just a feature request board"
          description="The core object in Doxa is an Item — a feature, idea, bug, requirement, or whatever your organisation calls it. Doxa isn't locked into one industry or use case."
        />
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
          {EXAMPLES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="border-border bg-card flex flex-col items-center gap-2 rounded-xl border p-5 text-center"
            >
              <Icon
                className="text-primary size-5"
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
