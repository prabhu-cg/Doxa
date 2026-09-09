import { ArrowUp, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Bulk export items to CSV",
    votes: 42,
    comments: 8,
    priority: "High priority",
    priorityDot: "bg-destructive",
    badge: { label: "Decided · Planned", variant: "default" as const },
  },
  {
    title: "Dark mode for the board view",
    votes: 31,
    comments: 3,
    priority: "Medium priority",
    priorityDot: "bg-amber-500",
    badge: { label: "Under review", variant: "outline" as const },
  },
  {
    title: "Slack notification on status change",
    votes: 19,
    comments: 5,
    priority: "Low priority",
    priorityDot: "bg-muted-foreground/40",
    badge: { label: "Collecting", variant: "outline" as const },
  },
];

/**
 * A representative Doxa board — illustrative content for the marketing
 * site, built from the same shadcn primitives the real app uses. Not a
 * screenshot; the real board doesn't exist yet. Deliberately touches all
 * five hero concepts (item, votes, discussion, priority, decision) in one
 * compact card rather than five separate graphics.
 */
export function BoardPreview() {
  return (
    <Card size="sm" className="w-full max-w-md shadow-lg" aria-hidden="true">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>Feature requests</span>
          <Badge variant="secondary">3 open</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={item.title}>
            {index > 0 ? <Separator className="mb-3" /> : null}
            <div className="flex items-start gap-3">
              <div className="border-border bg-muted/50 flex flex-col items-center rounded-md border px-2 py-1">
                <ArrowUp className="text-primary size-3.5" />
                <span className="text-xs font-semibold">{item.votes}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="size-3" />
                    {item.comments}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn("size-1.5 rounded-full", item.priorityDot)}
                      aria-hidden="true"
                    />
                    {item.priority}
                  </span>
                  <Badge variant={item.badge.variant} className="text-[11px]">
                    {item.badge.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
