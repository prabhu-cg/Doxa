import { Boxes, Users, Lightbulb, Wrench, Landmark } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { UseCaseCard } from "@/components/marketing/use-case-card";

const USE_CASES = [
  {
    icon: Boxes,
    title: "Product teams",
    description: "Collect and prioritise feature requests from users.",
  },
  {
    icon: Users,
    title: "Customer communities",
    description: "Let customers propose and vote on what matters to them.",
  },
  {
    icon: Lightbulb,
    title: "Internal teams",
    description: "Gather and act on ideas from across the organisation.",
  },
  {
    icon: Wrench,
    title: "IT & service teams",
    description: "Track requests and communicate what's being worked on.",
  },
  {
    icon: Landmark,
    title: "Organisations & communities",
    description: "Collect proposals and explain decisions transparently.",
  },
];

export function UseCasesSection() {
  return (
    <section className="bg-background border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Use cases"
          title="One platform. Many ways to use it."
          description="Doxa doesn't assume who's using it or what they call an Item."
        />
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {USE_CASES.map((useCase) => (
            <UseCaseCard
              key={useCase.title}
              icon={useCase.icon}
              title={useCase.title}
              description={useCase.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
