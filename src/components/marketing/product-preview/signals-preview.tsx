import {
  ArrowUp,
  MessageSquare,
  TrendingUp,
  Target,
  Banknote,
  Gauge,
  Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const SIGNALS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: ArrowUp, label: "Votes", value: "42" },
  { icon: MessageSquare, label: "Comments", value: "8" },
  { icon: TrendingUp, label: "Demand", value: "High" },
  { icon: Target, label: "Impact", value: "High" },
  { icon: Banknote, label: "Business value", value: "$$$" },
  { icon: Gauge, label: "Effort", value: "Low" },
  { icon: Compass, label: "Strategic fit", value: "Aligned" },
];

/**
 * Illustrates signals feeding a single item into a priority — not a
 * literal current feature, representative of the prioritisation workflow
 * Doxa is designed to support.
 */
export function SignalsPreview() {
  return (
    <Card size="sm" className="w-full max-w-md shadow-lg" aria-hidden="true">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>Bulk export items to CSV</span>
          <Badge>Priority: High</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {SIGNALS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
                <Icon className="size-3.5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground truncate text-xs">
                  {label}
                </p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <Separator className="my-3" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          All seven signals feed one priority score — not a vote count on its
          own.
        </p>
      </CardContent>
    </Card>
  );
}
