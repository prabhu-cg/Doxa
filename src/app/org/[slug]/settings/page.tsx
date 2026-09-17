import type { Metadata } from "next";
import {
  countOwners,
  listMembersForOrganization,
  requireOrganizationMembership,
} from "@/features/organizations/queries";
import {
  canChangeMemberRole,
  canUpdateOrganization,
  canLeaveOrganization,
  canManageMembers,
  canRemoveMember,
  hasAtLeastRole,
} from "@/features/organizations/permissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LinkButton } from "@/components/link-button";
import { UpdateOrganizationForm } from "./update-organization-form";
import { LeaveOrganizationDialog } from "./leave-organization-dialog";
import { RemoveMemberControl } from "./remove-member-control";
import { MemberRoleControl } from "./member-role-control";
import type { MembershipRole } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Organisation settings" };

export default async function OrganizationSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { membership } = await requireOrganizationMembership(slug);
  const [members, ownerCount] = await Promise.all([
    listMembersForOrganization(membership.organization.id),
    countOwners(membership.organization.id),
  ]);

  const canEdit = canUpdateOrganization(membership.role);
  const canLeave = canLeaveOrganization(membership.role, ownerCount);
  const canManage = canManageMembers(membership.role);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Organisation settings
        </h1>
        <p className="text-muted-foreground text-sm">
          {membership.organization.name}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Name</h2>
        {canEdit ? (
          <UpdateOrganizationForm
            slug={slug}
            initialName={membership.organization.name}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            {membership.organization.name} — only owners and admins can rename
            the organisation.
          </p>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Members ({members.length})</h2>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">
                  {m.user.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-sm">
                {m.user.displayName}
              </span>
              {canManage &&
              m.userId !== membership.userId &&
              canChangeMemberRole(
                membership.role,
                m.role,
                m.role,
                ownerCount,
              ) ? (
                <MemberRoleControl
                  slug={slug}
                  membershipId={m.id}
                  currentRole={m.role}
                  assignableRoles={
                    hasAtLeastRole(membership.role, "OWNER")
                      ? (["MEMBER", "ADMIN", "OWNER"] as MembershipRole[])
                      : (["MEMBER", "ADMIN"] as MembershipRole[])
                  }
                />
              ) : (
                <Badge variant="secondary">{m.role}</Badge>
              )}
              {canManage &&
              m.userId !== membership.userId &&
              canRemoveMember(membership.role, m.role, ownerCount) ? (
                <RemoveMemberControl
                  slug={slug}
                  membershipId={m.id}
                  memberName={m.user.displayName}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Content configuration</h2>
        <p className="text-muted-foreground text-sm">
          Item types, statuses, categories, and tags are per-organisation data,
          not fixed choices.
        </p>
        <div className="flex flex-wrap gap-2">
          <LinkButton
            variant="outline"
            size="sm"
            href={`/org/${slug}/settings/item-types`}
          >
            Item types
          </LinkButton>
          <LinkButton
            variant="outline"
            size="sm"
            href={`/org/${slug}/settings/statuses`}
          >
            Statuses
          </LinkButton>
          <LinkButton
            variant="outline"
            size="sm"
            href={`/org/${slug}/settings/priorities`}
          >
            Priorities
          </LinkButton>
          <LinkButton
            variant="outline"
            size="sm"
            href={`/org/${slug}/settings/scoring`}
          >
            Scoring criteria
          </LinkButton>
          <LinkButton
            variant="outline"
            size="sm"
            href={`/org/${slug}/settings/categories`}
          >
            Categories
          </LinkButton>
          <LinkButton
            variant="outline"
            size="sm"
            href={`/org/${slug}/settings/tags`}
          >
            Tags
          </LinkButton>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Plan, branding &amp; audit</h2>
        <div className="flex flex-wrap gap-2">
          <LinkButton
            variant="outline"
            size="sm"
            href={`/org/${slug}/settings/billing`}
          >
            Billing
          </LinkButton>
          <LinkButton
            variant="outline"
            size="sm"
            href={`/org/${slug}/settings/branding`}
          >
            Branding
          </LinkButton>
          {canManage ? (
            <LinkButton
              variant="outline"
              size="sm"
              href={`/org/${slug}/settings/audit-log`}
            >
              Audit log
            </LinkButton>
          ) : null}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Leave organisation</h2>
        <LeaveOrganizationDialog
          slug={slug}
          organizationName={membership.organization.name}
          disabled={!canLeave}
          disabledReason={
            canLeave
              ? undefined
              : "You're the only owner — promote someone else to owner first."
          }
        />
      </section>
    </div>
  );
}
