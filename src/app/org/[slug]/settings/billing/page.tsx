import type { Metadata } from "next";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import {
  getSubscriptionForOrganization,
  listPlans,
} from "@/features/billing/queries";
import { getUsageForOrganization } from "@/features/entitlements/queries";
import { canManageBilling } from "@/features/billing/permissions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanPicker } from "./plan-picker";
import { CancelSubscriptionControl } from "./cancel-subscription-control";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const organizationId = membership.organization.id;

  const [subscription, usage, plans] = await Promise.all([
    getSubscriptionForOrganization(organizationId),
    getUsageForOrganization(organizationId),
    listPlans(),
  ]);

  if (!subscription) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="text-destructive text-sm">
          This organisation has no billing record. Contact support.
        </p>
      </div>
    );
  }

  const canManage = canManageBilling(membership.role);
  const { plan } = subscription;

  const usageRows: { label: string; used: number; limit: number | null }[] = [
    { label: "Members", used: usage.members, limit: plan.maxMembers },
    { label: "Boards", used: usage.boards, limit: plan.maxBoards },
    { label: "Items", used: usage.items, limit: plan.maxItems },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm">
          Doxa stays useful for free — upgrade for higher limits and advanced
          prioritisation, analytics, branding, and integrations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current plan: {plan.name}
            <Badge variant="secondary">{subscription.status}</Badge>
            {subscription.cancelAtPeriodEnd ? (
              <Badge variant="destructive">Cancels at period end</Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {usageRows.map((row) => (
            <p key={row.label} className="text-muted-foreground text-sm">
              {row.label}: {row.used}
              {row.limit === null ? "" : ` / ${row.limit}`}
              {row.limit !== null && row.used >= row.limit ? (
                <span className="text-destructive"> · at limit</span>
              ) : null}
            </p>
          ))}
        </CardContent>
      </Card>

      {canManage ? (
        <>
          <PlanPicker
            orgSlug={slug}
            plans={plans}
            currentPlanKey={plan.key}
            currentBillingPeriod={subscription.billingPeriod}
          />
          {plan.key !== "FREE" && !subscription.cancelAtPeriodEnd ? (
            <CancelSubscriptionControl orgSlug={slug} />
          ) : null}
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          Only the organisation owner can change or cancel the plan.
        </p>
      )}
    </div>
  );
}
