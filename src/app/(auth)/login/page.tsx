import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { AuthBrand, AuthBrandFooter } from "@/components/auth/auth-brand";
import { getOrganizationFromNext } from "@/features/organizations/public";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
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
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            {organization ? `Welcome back.` : "Welcome back to Doxa."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>
      {organization ? <AuthBrandFooter /> : null}
    </>
  );
}
