import type { LucideIcon } from "lucide-react";

export function StepCard({
  index,
  icon: Icon,
  title,
  description,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="border-border bg-card relative rounded-xl border p-6">
      <span
        className="text-muted-foreground/30 absolute top-4 right-5 font-mono text-3xl font-bold"
        aria-hidden="true"
      >
        {String(index).padStart(2, "0")}
      </span>
      <div className="bg-primary/10 text-primary mb-4 flex size-9 items-center justify-center rounded-lg">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mb-1.5 font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
