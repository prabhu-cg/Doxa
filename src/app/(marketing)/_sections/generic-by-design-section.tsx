import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";

const EXAMPLES = [
  "Product feedback",
  "Customer suggestions",
  "Internal ideas",
  "IT requests",
  "Community proposals",
  "Service improvements",
];

export function GenericByDesignSection() {
  return (
    <section className="border-t py-16 sm:py-20">
      <SectionHeading
        eyebrow="Generic by design"
        title="Not just a feature request board"
        description="The core object in Doxa is an Item — a feature, idea, bug, requirement, or whatever your organisation calls it. Doxa isn't locked into one industry or use case."
      />
      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <Badge key={example} variant="outline" className="px-3 py-1 text-sm">
            {example}
          </Badge>
        ))}
      </div>
    </section>
  );
}
