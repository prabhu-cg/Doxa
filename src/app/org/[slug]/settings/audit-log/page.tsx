import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { hasAtLeastRole } from "@/features/organizations/permissions";
import { listAuditLogForOrganization } from "@/features/audit-log/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Audit log" };

const ACTION_LABELS: Record<string, string> = {
  MEMBER_ADDED: "Member added",
  MEMBER_REMOVED: "Member removed",
  MEMBER_ROLE_CHANGED: "Role changed",
  ORGANIZATION_UPDATED: "Organisation updated",
  BRANDING_UPDATED: "Branding updated",
  BOARD_CREATED: "Board created",
  BOARD_ARCHIVED: "Board archived",
  BOARD_RESTORED: "Board restored",
  DECISION_RECORDED: "Decision recorded",
  PLAN_CHANGED: "Plan changed",
};

export default async function AuditLogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  if (!hasAtLeastRole(membership.role, "ADMIN")) notFound();

  const entries = await listAuditLogForOrganization(
    membership.organization.id,
    { limit: 200 },
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit log</h1>
        <p className="text-muted-foreground text-sm">
          Significant administrative and security events for this organisation,
          most recent first. Never shows secrets or tokens.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">No events recorded yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Badge variant="outline">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.actor?.displayName ?? "System"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.createdAt.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
