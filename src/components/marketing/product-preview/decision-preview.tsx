import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * Illustrates a decision record — the concept of closing the loop on an
 * item, not a literal current feature. Representative of the decision
 * workflow Doxa is designed to support.
 */
export function DecisionPreview() {
  return (
    <Card size="sm" className="w-full max-w-md shadow-lg" aria-hidden="true">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>Bulk export items to CSV</span>
          <Badge>Planned</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Evidence
          </p>
          <p className="mt-1">
            42 votes · 8 comments · requested by 6 accounts
          </p>
        </div>
        <Separator />
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Rationale
          </p>
          <p className="mt-1">
            High demand from data-heavy teams; low effort to build against the
            existing export pipeline.
          </p>
        </div>
        <Separator />
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Next
          </p>
          <p className="mt-1">
            Targeted for the next release. Followers notified.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
