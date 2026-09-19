"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LinkButton } from "@/components/link-button";
import { UpdateOrganizationForm } from "@/app/org/[slug]/settings/update-organization-form";
import { LeaveOrganizationDialog } from "@/app/org/[slug]/settings/leave-organization-dialog";
import { RemoveMemberControl } from "@/app/org/[slug]/settings/remove-member-control";
import { MemberRoleControl } from "@/app/org/[slug]/settings/member-role-control";
import { ContentConfigDrawer } from "./content-config-drawer";
import {
  canChangeMemberRole,
  canRemoveMember,
  hasAtLeastRole,
} from "@/features/organizations/permissions";
import type { MembershipRole } from "@/generated/prisma/client";
import type { ContentConfigData } from "./page";

type Member = {
  id: string;
  userId: string;
  role: MembershipRole;
  user: { displayName: string };
};

/**
 * The Organisation Settings drawer's body — the same content as
 * `/org/[slug]/settings/page.tsx`, except "Content configuration" is a
 * single button that opens the nested ContentConfigDrawer instead of six
 * separate links out to their own full pages (see that component's doc
 * comment). Everything else (rename, members, billing/branding/audit
 * links, leave) behaves identically to the full-page fallback.
 */
export function OrgSettingsModalContent({
  slug,
  organizationName,
  currentUserId,
  actorRole,
  members,
  ownerCount,
  canEdit,
  canManage,
  canLeave,
  contentConfig,
}: {
  slug: string;
  organizationName: string;
  currentUserId: string;
  actorRole: MembershipRole;
  members: Member[];
  ownerCount: number;
  canEdit: boolean;
  canManage: boolean;
  canLeave: boolean;
  contentConfig: ContentConfigData;
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Name</h2>
        {canEdit ? (
          <UpdateOrganizationForm slug={slug} initialName={organizationName} />
        ) : (
          <p className="text-muted-foreground text-sm">
            {organizationName} — only owners and admins can rename the
            organisation.
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
              m.userId !== currentUserId &&
              canChangeMemberRole(actorRole, m.role, m.role, ownerCount) ? (
                <MemberRoleControl
                  slug={slug}
                  membershipId={m.id}
                  currentRole={m.role}
                  assignableRoles={
                    hasAtLeastRole(actorRole, "OWNER")
                      ? (["MEMBER", "ADMIN", "OWNER"] as MembershipRole[])
                      : (["MEMBER", "ADMIN"] as MembershipRole[])
                  }
                />
              ) : (
                <Badge variant="secondary">{m.role}</Badge>
              )}
              {canManage &&
              m.userId !== currentUserId &&
              canRemoveMember(actorRole, m.role, ownerCount) ? (
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
          Item types, statuses, priorities, scoring, categories, and tags are
          per-organisation data, not fixed choices.
        </p>
        <ContentConfigDrawer orgSlug={slug} {...contentConfig} />
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
          organizationName={organizationName}
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
