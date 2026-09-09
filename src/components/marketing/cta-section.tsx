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
          ? "bg-primary px-6 py-20 sm:py-28"
          : "border-border bg-card rounded-2xl border px-6 py-14 sm:px-12",
      )}
    >
      <h2
        className={cn(
          "mx-auto max-w-xl text-3xl font-bold tracking-tight text-balance sm:text-4xl",
          isBanner && "text-primary-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mx-auto mt-3 max-w-lg text-balance",
            isBanner
              ? "text-primary-foreground/80"
              : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <LinkButton
          size="lg"
          href={ctaHref}
          className={cn(
            isBanner &&
              "bg-background text-foreground hover:bg-secondary gap-2",
          )}
        >
          {ctaLabel}
          {isBanner ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
        </LinkButton>
        {secondaryLabel && secondaryHref ? (
          <LinkButton
            size="lg"
            variant="outline"
            href={secondaryHref}
            className={cn(
              isBanner &&
                "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent",
            )}
          >
            {secondaryLabel}
          </LinkButton>
        ) : null}
      </div>
    </section>
  );
}
