import "server-only";
import { db } from "@/server/db";
import { getAuthenticatedSupabaseUser } from "@/features/auth/queries";
import { getOrCreateProfile } from "@/features/profile/queries";
import { getBoardBySlug } from "@/features/boards/queries";
import {
  getItemForOrgMember,
  getItemForVisitor,
  type ItemWithRelations,
} from "@/features/items/queries";
import type {
  MembershipRole,
  Organization,
  Profile,
} from "@/generated/prisma/client";
import type { BoardWithSpace } from "@/features/boards/queries";

/**
 * Who is on the other end of a public page or a participation action.
 *
 * A *participant* is anyone signed in with a verified email who is not a
 * member of the organisation — typically a customer. They may take part on
 * the organisation's Public, active boards and nowhere else, and they are never
 * a `Membership`: a member can see Private boards and, at ADMIN+, change
 * things, so a customer must not be made one just to let them vote.
 */
export type Viewer =
  | { status: "anonymous" }
  | { status: "unverified"; profile: Profile }
  | { status: "blocked"; profile: Profile }
  | {
      status: "active";
      profile: Profile;
      /** null for a community participant; the member's role otherwise. */
      role: MembershipRole | null;
    };

type AuthUser = NonNullable<
  Awaited<ReturnType<typeof getAuthenticatedSupabaseUser>>
>;

/** `knownUser` saves a round trip to the auth server when the caller has
 * already asked who is signed in. */
async function resolveViewer(
  organizationId: string,
  knownUser?: AuthUser | null,
): Promise<Viewer> {
  const user =
    knownUser === undefined ? await getAuthenticatedSupabaseUser() : knownUser;
  if (!user) return { status: "anonymous" };

  const profile = await getOrCreateProfile(user.id, user.email);
  const membership = await db.membership.findUnique({
    where: { organizationId_userId: { organizationId, userId: user.id } },
  });
  if (membership) {
    return { status: "active", profile, role: membership.role };
  }

  if (!user.email_confirmed_at) return { status: "unverified", profile };

  const block = await db.participantBlock.findUnique({
    where: { organizationId_userId: { organizationId, userId: user.id } },
    select: { id: true },
  });
  if (block) return { status: "blocked", profile };

  return { status: "active", profile, role: null };
}

/** For the public pages: what the current visitor may do on this organisation's
 * boards. Never throws — a signed-out visitor is just "anonymous". */
export const getViewer = resolveViewer;

export type ParticipationContext = {
  profile: Profile;
  organization: Organization;
  board: BoardWithSpace;
  /** null for a community participant. */
  role: MembershipRole | null;
};

export type ParticipationResult<T> =
  ({ ok: true } & T) | { ok: false; error: string };

const NOT_OPEN = "This board isn't open for participation";

/**
 * The gate for every vote, comment, follow and submission. Unlike the
 * member-only guards it returns a result rather than redirecting or 404ing:
 * the caller is a button on a public page and needs a sentence to show.
 *
 * A non-member gets in only on a Public, active board; for anything else they
 * get the same answer as for a board that doesn't exist, so it can't be used
 * to find out which private boards exist.
 */
export async function requireParticipation(
  orgSlug: string,
  boardSlug: string,
): Promise<ParticipationResult<ParticipationContext>> {
  const organization = await db.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!organization) return { ok: false, error: NOT_OPEN };

  const viewer = await resolveViewer(organization.id);
  if (viewer.status === "anonymous") {
    return { ok: false, error: "Sign in to take part" };
  }

  const board = await getBoardBySlug(organization.id, boardSlug);
  if (!board) return { ok: false, error: NOT_OPEN };

  if (viewer.status === "active" && viewer.role !== null) {
    return {
      ok: true,
      profile: viewer.profile,
      organization,
      board,
      role: viewer.role,
    };
  }

  if (board.visibility !== "PUBLIC" || board.status !== "ACTIVE") {
    return { ok: false, error: NOT_OPEN };
  }
  if (viewer.status === "unverified") {
    return {
      ok: false,
      error: "Confirm your email address to take part — check your inbox",
    };
  }
  if (viewer.status === "blocked") {
    return { ok: false, error: "You can't take part in this community" };
  }
  return {
    ok: true,
    profile: viewer.profile,
    organization,
    board,
    role: null,
  };
}

export async function requireItemParticipation(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
): Promise<
  ParticipationResult<ParticipationContext & { item: ItemWithRelations }>
> {
  const access = await requireParticipation(orgSlug, boardSlug);
  if (!access.ok) return access;

  const item =
    access.role === null
      ? await getItemForVisitor(access.board.id, itemSlug)
      : await getItemForOrgMember(access.board.id, itemSlug);
  if (!item) return { ok: false, error: "That item no longer exists" };

  return { ...access, item };
}
