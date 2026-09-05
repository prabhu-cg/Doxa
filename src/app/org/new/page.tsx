import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCurrentProfile } from "@/features/profile/queries";
import { CreateOrganizationForm } from "./create-organization-form";

export const metadata: Metadata = { title: "New organisation" };

export default async function NewOrganizationPage() {
  await requireCurrentProfile();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an organisation</CardTitle>
          <CardDescription>You&apos;ll be its owner.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm />
        </CardContent>
      </Card>
    </main>
  );
}
