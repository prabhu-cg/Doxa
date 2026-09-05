import {
  Inbox,
  MessageCircle,
  BarChart3,
  ListOrdered,
  CheckCircle2,
  Megaphone,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { StepCard } from "@/components/marketing/step-card";

const STEPS = [
  {
    icon: Inbox,
    title: "Collect",
    description: "Ideas, requests, issues and suggestions land in one place.",
  },
  {
    icon: MessageCircle,
    title: "Discuss",
    description:
      "People vote, comment, and add context to what matters to them.",
  },
  {
    icon: BarChart3,
    title: "Understand",
    description: "See demand, evidence and discussion together, not scattered.",
  },
  {
    icon: ListOrdered,
    title: "Prioritise",
    description: "Weigh signals against impact, effort and strategic fit.",
  },
  {
    icon: CheckCircle2,
    title: "Decide",
    description: "Record what was decided and why — not just a status change.",
  },
  {
    icon: Megaphone,
    title: "Communicate",
    description: "Tell people what happened to what they asked for.",
  },
];

export function LoopSection() {
  return (
    <section className="border-t py-16 sm:py-20">
      <SectionHeading
        eyebrow="The loop"
        title="One loop, from input to outcome"
        description="Doxa is built around a single loop, not a pile of disconnected features."
      />
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, index) => (
          <StepCard
            key={step.title}
            index={index + 1}
            icon={step.icon}
            title={step.title}
            description={step.description}
          />
        ))}
      </div>
    </section>
  );
}
