import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
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
import { CTASection } from "@/components/marketing/cta-section";
import { Badge } from "@/components/ui/badge";
import { BoardPreview } from "@/components/marketing/product-preview/board-preview";
import { PrioritizationPreview } from "@/components/marketing/product-preview/prioritization-preview";
import { AdminPreview } from "@/components/marketing/product-preview/admin-preview";

export const metadata: Metadata = {
  title: "Features",
  description:
    "What Doxa does today, and what it's designed to support as it's built out — feedback, prioritisation, decisions, and organisation controls.",
  alternates: { canonical: "/features" },
};

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  planned?: boolean;
};

const COMMUNITY: Feature[] = [
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
];

const PRODUCT_MANAGEMENT: Feature[] = [
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
];

const ADMINISTRATION: Feature[] = [
  {
    icon: Building2,
    title: "Organisations",
    description: "Create an organisation and manage membership.",
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
];

const FUTURE: Feature[] = [
  {
    icon: Sparkles,
    title: "AI",
    description: "Summarisation and duplicate detection.",
  },
  {
    icon: Code2,
    title: "API",
    description: "Programmatic access to your data.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "React to events in your own systems.",
  },
  {
    icon: Plug,
    title: "Integrations",
    description: "Connect Doxa to your existing tools.",
  },
  {
    icon: LineChart,
    title: "Advanced analytics",
    description: "Deeper insight into demand and outcomes.",
  },
];

function FeatureList({ features }: { features: Feature[] }) {
  return (
    <ul className="mt-6 space-y-4">
      {features.map(({ icon: Icon, title, description, planned }) => (
        <li key={title} className="flex gap-3">
          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              {title}
              {planned ? (
                <Badge variant="secondary" className="text-xs">
                  Planned
                </Badge>
              ) : null}
            </p>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Features"
          title="What Doxa does, and what it's built to do"
          description="Organisation setup is live today. Everything else here is what the rest of the loop is designed to support as it's built out."
        />

        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Where input comes in
            </h2>
            <p className="text-muted-foreground mt-3">
              People submit feedback, vote on what matters to them, and discuss
              it in the open — so demand is visible instead of scattered across
              inboxes and spreadsheets.
            </p>
            <FeatureList features={COMMUNITY} />
          </div>
          <div className="flex justify-center lg:justify-end">
            <BoardPreview />
          </div>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <PrioritizationPreview />
          </div>
          <div className="order-1 flex flex-col justify-center lg:order-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Turning input into a plan
            </h2>
            <p className="text-muted-foreground mt-3">
              Teams weigh signals against impact and effort, track status with
              tags and categories, and show what&apos;s planned, in progress and
              shipped.
            </p>
            <FeatureList features={PRODUCT_MANAGEMENT} />
          </div>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold tracking-tight">
              How organisations run Doxa
            </h2>
            <p className="text-muted-foreground mt-3">
              Organisations and permissions are live today. Spaces, branding and
              moderation are designed to layer on top as an organisation grows.
            </p>
            <FeatureList features={ADMINISTRATION} />
          </div>
          <div className="flex justify-center lg:justify-end">
            <AdminPreview />
          </div>
        </div>

        <div className="mt-20 border-t pt-16 text-center">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Future &amp; advanced
          </p>
          <h2 className="mx-auto mt-3 max-w-md text-2xl font-bold tracking-tight text-balance">
            Designed to grow with you
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md">
            None of this exists yet, but the architecture is designed to support
            it as Doxa grows.
          </p>
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3">
            {FUTURE.map(({ icon: Icon, title }) => (
              <span
                key={title}
                className="border-border bg-card inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
              >
                <Icon className="text-primary size-4" aria-hidden="true" />
                {title}
              </span>
            ))}
          </div>
        </div>
      </div>
      <CTASection
        variant="banner"
        title="Start with the basics today."
        description="Create an organisation now — the rest of the loop is on the way."
      />
    </>
  );
}
