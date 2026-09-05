import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground text-lg text-balance">
          {description}
        </p>
      ) : null}
    </div>
  );
}
