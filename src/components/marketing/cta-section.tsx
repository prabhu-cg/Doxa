import { LinkButton } from "@/components/link-button";

export function CTASection({
  title,
  description,
  ctaLabel = "Start Free",
  ctaHref = "/signup",
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="border-border bg-card rounded-2xl border px-6 py-14 text-center sm:px-12">
      <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-balance">
          {description}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <LinkButton size="lg" href={ctaHref}>
          {ctaLabel}
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
