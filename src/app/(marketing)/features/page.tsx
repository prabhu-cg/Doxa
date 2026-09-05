import type { Metadata } from "next";
import {
  MessageSquare,
  ArrowUp,
  MessageCircle,
  Bell,
  Users,
  ListOrdered,
  Tag,
  FolderTree,
  Tags,
  Map,
  CheckCircle2,
  Building2,
  LayoutGrid,
  Shield,
  Palette,
  ShieldCheck,
  Sparkles,
  Code2,
  Webhook,
  Plug,
  LineChart,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FeatureCard } from "@/components/marketing/feature-card";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Features",
  description:
    "What Doxa does today, and what it's designed to support as it's built out — feedback, prioritisation, decisions, and organisation controls.",
  alternates: { canonical: "/features" },
};

const CATEGORIES = [
  {
    title: "Community",
    description: "How people submit and engage with input.",
    features: [
      {
        icon: MessageSquare,
        title: "Feedback",
        description: "Collect ideas, requests and issues in one place.",
        planned: true,
      },
      {
        icon: ArrowUp,
        title: "Voting",
        description: "Let people signal what matters to them.",
        planned: true,
      },
      {
        icon: MessageCircle,
        title: "Comments",
        description: "Discuss and add context to any item.",
        planned: true,
      },
      {
        icon: Users,
        title: "Followers",
        description: "Follow an item to hear when it changes.",
        planned: true,
      },
      {
        icon: Bell,
        title: "Notifications",
        description: "Know when something you care about moves.",
        planned: true,
      },
    ],
  },
  {
    title: "Product management",
    description: "How teams turn input into a plan.",
    features: [
      {
        icon: ListOrdered,
        title: "Prioritisation",
        description: "Weigh demand against impact and effort.",
        planned: true,
      },
      {
        icon: Tag,
        title: "Statuses",
        description: "Track where each item stands.",
        planned: true,
      },
      {
        icon: FolderTree,
        title: "Categories",
        description: "Group items by area or theme.",
        planned: true,
      },
      {
        icon: Tags,
        title: "Tags",
        description: "Label items for fast filtering.",
        planned: true,
      },
      {
        icon: Map,
        title: "Roadmaps",
        description: "Show what's planned, in progress and shipped.",
        planned: true,
      },
      {
        icon: CheckCircle2,
        title: "Decisions",
        description: "Record what was decided, and why.",
        planned: true,
      },
    ],
  },
  {
    title: "Administration",
    description: "How organisations run Doxa.",
    features: [
      {
        icon: Building2,
        title: "Organisations",
        description: "Create an organisation and manage membership.",
        planned: false,
      },
      {
        icon: LayoutGrid,
        title: "Spaces & boards",
        description: "Organise items by team or product area.",
        planned: true,
      },
      {
        icon: Shield,
        title: "Permissions",
        description: "Owner, admin and member roles.",
        planned: false,
      },
      {
        icon: Palette,
        title: "Branding",
        description: "Make your Doxa instance feel like yours.",
        planned: true,
      },
      {
        icon: ShieldCheck,
        title: "Moderation",
        description: "Keep discussion on-topic and civil.",
        planned: true,
      },
    ],
  },
  {
    title: "Future & advanced",
    description: "Designed to support these as the platform grows.",
    features: [
      {
        icon: Sparkles,
        title: "AI",
        description: "Summarisation and duplicate detection.",
        planned: true,
      },
      {
        icon: Code2,
        title: "API",
        description: "Programmatic access to your data.",
        planned: true,
      },
      {
        icon: Webhook,
        title: "Webhooks",
        description: "React to events in your own systems.",
        planned: true,
      },
      {
        icon: Plug,
        title: "Integrations",
        description: "Connect Doxa to your existing tools.",
        planned: true,
      },
      {
        icon: LineChart,
        title: "Advanced analytics",
        description: "Deeper insight into demand and outcomes.",
        planned: true,
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Features"
        title="What Doxa does, and what it's built to do"
        description="Organisation setup is live today. Everything marked “Planned” is part of the roadmap, not yet available."
      />
      <div className="mt-14 space-y-14">
        {CATEGORIES.map((category) => (
          <section key={category.title}>
            <h2 className="text-xl font-semibold">{category.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {category.description}
            </p>
            <FeatureGrid className="mt-6" columns={3}>
              {category.features.map((feature) => (
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
        ))}
      </div>
      <div className="mt-16">
        <CTASection
          title="Start with the basics today."
          description="Create an organisation now — the rest of the loop is on the way."
        />
      </div>
    </div>
  );
}
