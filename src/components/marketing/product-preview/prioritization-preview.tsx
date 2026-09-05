import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const rows = [
  {
    title: "Bulk export items to CSV",
    impact: "High",
    effort: "Low",
    priority: "High",
  },
  {
    title: "Dark mode for the board view",
    impact: "Medium",
    effort: "Low",
    priority: "Medium",
  },
  {
    title: "SSO for enterprise orgs",
    impact: "High",
    effort: "High",
    priority: "Medium",
  },
];

const priorityVariant = {
  High: "default",
  Medium: "secondary",
  Low: "outline",
} as const;

/**
 * Illustrates combining signals (impact, effort) into a priority — not a
 * literal feature of the current app, framed as representative of the
 * prioritisation workflow Doxa is designed to support.
 */
export function PrioritizationPreview() {
  return (
    <Card className="w-full max-w-md shadow-lg" aria-hidden="true">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Prioritisation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.title}>
            {index > 0 ? <Separator className="mb-3" /> : null}
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 flex-1 truncate text-sm font-medium">
                {row.title}
              </p>
              <Badge
                variant={
                  priorityVariant[row.priority as keyof typeof priorityVariant]
                }
              >
                {row.priority}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Impact: {row.impact} · Effort: {row.effort}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
