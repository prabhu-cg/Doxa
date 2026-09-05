import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  planned,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  planned?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-card rounded-xl border p-6 transition-colors",
        className,
      )}
    >
      <div className="bg-primary/10 text-primary mb-4 flex size-9 items-center justify-center rounded-lg">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="mb-1.5 flex items-center gap-2">
        <h3 className="font-semibold">{title}</h3>
        {planned ? (
          <Badge variant="secondary" className="text-xs">
            Planned
          </Badge>
        ) : null}
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
