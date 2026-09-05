import { redirect } from "next/navigation";
import { requireCurrentProfile } from "@/features/profile/queries";
import { listMembershipsForUser } from "@/features/organizations/queries";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireCurrentProfile();
  const memberships = await listMembershipsForUser(profile.id);

  // Onboarding is only for users with no organisation yet — anyone else
  // belongs at their org dashboard instead.
  if (memberships.length > 0)
    redirect(`/org/${memberships[0].organization.slug}`);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-extrabold tracking-tight">Doxa</span>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
