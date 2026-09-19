"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePlan } from "@/features/billing/actions";
import type { Plan } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}/mo`;
}

export function PlanPicker({
  orgSlug,
  plans,
  currentPlanKey,
  currentBillingPeriod,
  paidPlansAvailable,
}: {
  orgSlug: string;
  plans: Plan[];
  currentPlanKey: string;
  currentBillingPeriod: string;
  paidPlansAvailable: boolean;
}) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSelect(planKey: string) {
    setPendingKey(planKey);
    setError(null);
    const result = await changePlan(orgSlug, {
      planKey,
      billingPeriod: currentBillingPeriod,
    });
    setPendingKey(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (result.checkoutUrl) {
      window.location.assign(result.checkoutUrl);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlanKey;
          const unavailable = plan.key !== "FREE" && !paidPlansAvailable;
          return (
            <Card key={plan.key} className={isCurrent ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {plan.name}
                  {isCurrent ? <Badge>Current</Badge> : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg font-semibold">
                  {formatPrice(plan.priceMonthlyCents ?? 0)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {plan.description}
                </p>
                {!isCurrent ? (
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={pendingKey !== null || unavailable}
                    onClick={() => onSelect(plan.key)}
                  >
                    {unavailable
                      ? "Not available yet"
                      : pendingKey === plan.key
                        ? "Switching…"
                        : `Switch to ${plan.name}`}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
