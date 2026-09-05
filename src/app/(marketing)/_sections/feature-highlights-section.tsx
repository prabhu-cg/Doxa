import {
  LayoutList,
  ArrowUp,
  MessageSquare,
  Tag,
  ListOrdered,
  Map,
  CheckCircle2,
  FileText,
  Search,
  Settings2,
  Building2,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FeatureCard } from "@/components/marketing/feature-card";

const FEATURES = [
  {
    icon: LayoutList,
    title: "Feedback boards",
    description: "Organise input by space and board.",
    planned: true,
  },
  {
    icon: ArrowUp,
    title: "Voting",
    description: "Let people signal what matters to them.",
    planned: true,
  },
  {
    icon: MessageSquare,
    title: "Discussion",
    description: "Comments and context on every item.",
    planned: true,
  },
  {
    icon: Tag,
    title: "Statuses",
    description: "Track where each item stands.",
    planned: true,
  },
  {
    icon: ListOrdered,
    title: "Prioritisation",
    description: "Weigh demand against impact and effort.",
    planned: true,
  },
  {
    icon: Map,
    title: "Roadmaps",
    description: "Show what's planned, in progress, and shipped.",
    planned: true,
  },
  {
    icon: CheckCircle2,
    title: "Decisions",
    description: "Record what was decided, not just a status.",
    planned: true,
  },
  {
    icon: FileText,
    title: "Decision rationale",
    description: "Capture why a decision was made.",
    planned: true,
  },
  {
    icon: Search,
    title: "Search & filtering",
    description: "Find items by status, tag or keyword.",
    planned: true,
  },
  {
    icon: Settings2,
    title: "Configurable item types",
    description: "Bugs, ideas, requests — your terminology.",
    planned: true,
  },
  {
    icon: Building2,
    title: "Organisation controls",
    description: "Organisations, membership and roles.",
    planned: false,
  },
];

export function FeatureHighlightsSection() {
  return (
    <section className="border-t py-16 sm:py-20">
      <SectionHeading
        eyebrow="What's in Doxa"
        title="Everything the loop needs"
        description="Organisation setup is live today. The rest is what Doxa is designed to support as it's built out."
      />
      <FeatureGrid className="mx-auto mt-10 max-w-5xl" columns={3}>
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            planned={feature.planned}
          />
        ))}
      </FeatureGrid>
    </section>
  );
}
