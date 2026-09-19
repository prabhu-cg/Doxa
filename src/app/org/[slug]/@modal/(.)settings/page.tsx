import {
  countOwners,
  listMembersForOrganization,
  requireOrganizationMembership,
} from "@/features/organizations/queries";
import {
  canUpdateOrganization,
  canLeaveOrganization,
  canManageMembers,
} from "@/features/organizations/permissions";
import { listItemTypesForOrganization } from "@/features/item-types/queries";
import { canManageItemTypes } from "@/features/item-types/permissions";
import { listStatusesForOrganization } from "@/features/statuses/queries";
import { canManageStatuses } from "@/features/statuses/permissions";
import { listPrioritiesForOrganization } from "@/features/priorities/queries";
import { canManagePriorities } from "@/features/priorities/permissions";
import { listScoreCriteriaForOrganization } from "@/features/scoring/queries";
import { canManageScoreCriteria } from "@/features/scoring/permissions";
import { listCategoriesForOrganization } from "@/features/categories/queries";
import { canManageCategories } from "@/features/categories/permissions";
import { listTagsForOrganization } from "@/features/tags/queries";
import { canManageTags } from "@/features/tags/permissions";
import { RouteModal } from "@/components/route-modal";
import { OrgSettingsModalContent } from "./org-settings-modal-content";
import type {
  Category,
  ItemType,
  Priority,
  ScoreCriterion,
  Status,
  Tag,
} from "@/generated/prisma/client";

export type ContentConfigData = {
  canManage: {
    itemTypes: boolean;
    statuses: boolean;
    priorities: boolean;
    scoreCriteria: boolean;
    categories: boolean;
    tags: boolean;
  };
  itemTypes: ItemType[];
  statuses: Status[];
  priorities: Priority[];
  scoreCriteria: ScoreCriterion[];
  categories: Category[];
  tags: Tag[];
};

/** Intercepts `/org/[slug]/settings` for a drawer — see
 * `src/app/org/[slug]/@modal/default.tsx`. Fetches everything the full
 * settings page needs PLUS the six content-configuration lists, so the
 * nested "Content configuration" drawer (content-config-drawer.tsx) can
 * render immediately with no fetch of its own. */
export default async function OrgSettingsModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { profile, membership } = await requireOrganizationMembership(slug);
  const organizationId = membership.organization.id;

  const [
    members,
    ownerCount,
    itemTypes,
    statuses,
    priorities,
    scoreCriteria,
    categories,
    tags,
  ] = await Promise.all([
    listMembersForOrganization(organizationId),
    countOwners(organizationId),
    listItemTypesForOrganization(organizationId, { includeArchived: true }),
    listStatusesForOrganization(organizationId, { includeArchived: true }),
    listPrioritiesForOrganization(organizationId, { includeArchived: true }),
    listScoreCriteriaForOrganization(organizationId, {
      includeArchived: true,
    }),
    listCategoriesForOrganization(organizationId),
    listTagsForOrganization(organizationId),
  ]);

  return (
    <RouteModal
      title="Organisation settings"
      description={membership.organization.name}
    >
      <OrgSettingsModalContent
        slug={slug}
        organizationName={membership.organization.name}
        currentUserId={profile.id}
        actorRole={membership.role}
        members={members}
        ownerCount={ownerCount}
        canEdit={canUpdateOrganization(membership.role)}
        canManage={canManageMembers(membership.role)}
        canLeave={canLeaveOrganization(membership.role, ownerCount)}
        contentConfig={{
          canManage: {
            itemTypes: canManageItemTypes(membership.role),
            statuses: canManageStatuses(membership.role),
            priorities: canManagePriorities(membership.role),
            scoreCriteria: canManageScoreCriteria(membership.role),
            categories: canManageCategories(membership.role),
            tags: canManageTags(membership.role),
          },
          itemTypes,
          statuses,
          priorities,
          scoreCriteria,
          categories,
          tags,
        }}
      />
    </RouteModal>
  );
}
