import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCurrentProfile } from "@/features/profile/queries";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profile settings" };

export default async function ProfilePage() {
  const profile = await requireCurrentProfile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile settings</CardTitle>
        <CardDescription>How you appear to others in Doxa.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm
          initialDisplayName={profile.displayName}
          initialUsername={profile.username ?? ""}
        />
      </CardContent>
    </Card>
  );
}
