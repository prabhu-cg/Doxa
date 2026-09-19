import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "./signup-form";
import { AuthBrand, AuthBrandFooter } from "@/components/auth/auth-brand";
import { getOrganizationFromNext } from "@/features/organizations/public";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Doxa account and start free.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const organization = await getOrganizationFromNext(next);

  return (
    <>
      {organization ? <AuthBrand organization={organization} /> : null}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            {organization
              ? "It takes a minute, and brings you straight back."
              : "Start collecting and prioritising feedback."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm next={next} />
        </CardContent>
      </Card>
      {organization ? <AuthBrandFooter /> : null}
    </>
  );
}
