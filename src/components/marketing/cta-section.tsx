import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { cn } from "@/lib/utils";

export function CTASection({
  title,
  description,
  ctaLabel = "Start Free",
  ctaHref = "/signup",
  secondaryLabel,
  secondaryHref,
  variant = "card",
}: {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  variant?: "card" | "banner";
}) {
  const isBanner = variant === "banner";

  return (
    <section
      className={cn(
        "text-center",
        isBanner
          ? "bg-background border-t px-6 py-20 sm:py-24"
          : "border-border bg-card rounded-card border px-6 py-14 sm:px-12",
      )}
    >
      <h2 className={cn("mx-auto max-w-xl text-3xl text-balance sm:text-4xl")}>
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mx-auto mt-3 max-w-lg text-balance",
            "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <LinkButton size="lg" href={ctaHref} className="gap-2">
          {ctaLabel}
          {isBanner ? (
            <ArrowRight className="size-4" aria-hidden="true" />
          ) : null}
        </LinkButton>
        {secondaryLabel && secondaryHref ? (
          <LinkButton size="lg" variant="outline" href={secondaryHref}>
            {secondaryLabel}
          </LinkButton>
        ) : null}
      </div>
    </section>
  );
}
