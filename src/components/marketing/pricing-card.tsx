import { Check } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  name: string;
  priceLabel: string;
  billingNote?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
};

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col rounded-xl border p-6",
        plan.highlighted && "border-primary ring-primary/20 ring-2",
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <h3 className="font-semibold">{plan.name}</h3>
        {plan.highlighted ? <Badge>Popular</Badge> : null}
      </div>
      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight">
          {plan.priceLabel}
        </span>
      </div>
      {plan.billingNote ? (
        <p className="text-muted-foreground mb-4 text-sm">{plan.billingNote}</p>
      ) : (
        <div className="mb-4" />
      )}
      <p className="text-muted-foreground mb-6 text-sm">{plan.description}</p>
      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <LinkButton
        variant={plan.highlighted ? "default" : "outline"}
        href={plan.ctaHref}
        className="w-full"
      >
        {plan.ctaLabel}
      </LinkButton>
    </div>
  );
}
