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
  Globe,
  Bell,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FeatureCard } from "@/components/marketing/feature-card";

const FEATURES = [
  {
    icon: LayoutList,
    title: "Feedback boards",
    description: "Organise input by space and board.",
  },
  {
    icon: ArrowUp,
    title: "Voting",
    description: "Signal what matters most — a signal, not a verdict.",
  },
  {
    icon: MessageSquare,
    title: "Discussion",
    description: "Comments and context on every item.",
  },
  {
    icon: Tag,
    title: "Statuses",
    description: "Track where each item stands.",
  },
  {
    icon: ListOrdered,
    title: "Prioritisation",
    description: "Weigh demand against impact and effort.",
  },
  {
    icon: Map,
    title: "Roadmaps",
    description: "Show what's planned, in progress, and shipped.",
  },
  {
    icon: CheckCircle2,
    title: "Decisions",
    description: "Record what was decided, not just a status.",
  },
  {
    icon: FileText,
    title: "Decision rationale",
    description: "Capture why a decision was made.",
  },
  {
    icon: Search,
    title: "Search & filtering",
    description: "Find items by status, tag or keyword.",
  },
  {
    icon: Settings2,
    title: "Configurable item types",
    description: "Bugs, ideas, requests — your terminology.",
  },
  {
    icon: Globe,
    title: "Public boards & roadmap",
    description: "Share a link anyone can browse, no account needed.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Voters hear when a decision is made.",
  },
  {
    icon: Building2,
    title: "Organisation controls",
    description: "Organisations, membership and roles.",
  },
];

export function FeatureHighlightsSection() {
  return (
    <section className="bg-background border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="What's in Doxa"
          title="Everything the loop needs"
          description="All of this is live today. Letting customers sign in to vote and comment on public boards is next."
        />
        <FeatureGrid className="mx-auto mt-10 max-w-5xl" columns={3}>
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </FeatureGrid>
      </div>
    </section>
  );
}
