import type { LucideIcon } from "lucide-react";

export function UseCaseCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="border-border bg-card flex items-start gap-3 rounded-xl border p-5">
      <div className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="mb-1 font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
