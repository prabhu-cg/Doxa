import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";
import { getAuthenticatedSupabaseUser } from "@/features/auth/queries";
import { getInviteByToken } from "@/features/organizations/queries";
import { authPath } from "@/lib/safe-next";
import { JoinOrganizationForm } from "./join-organization-form";

export const metadata: Metadata = { title: "Join organisation" };

/**
 * Landing page for an organisation's shareable invite link
 * (`/org/[slug]/settings` → "Invite link"). A signed-out visitor is sent to
 * sign in or sign up with `next` pointing back here (same `next`-survives-
 * confirmation pattern as public board participation — see
 * src/lib/safe-next.ts), then lands back here to actually redeem it.
 */
export default async function JoinOrganizationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Invite link not valid</CardTitle>
          <CardDescription>
            This link has been revoked, regenerated, or never existed. Ask
            whoever shared it to send you a new one.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const user = await getAuthenticatedSupabaseUser();
  const nextPath = `/join/${token}`;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Join {invite.organization.name}</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join {invite.organization.name} on
          Doxa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user ? (
          <JoinOrganizationForm token={token} />
        ) : (
          <div className="flex flex-col gap-2">
            <LinkButton href={authPath("login", nextPath)} className="w-full">
              Sign in to join
            </LinkButton>
            <LinkButton
              href={authPath("signup", nextPath)}
              variant="outline"
              className="w-full"
            >
              Create an account
            </LinkButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
