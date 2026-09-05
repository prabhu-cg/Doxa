import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthenticatedSupabaseUser } from "@/features/auth/queries";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Set new password" };

export default async function ResetPasswordPage() {
  const user = await getAuthenticatedSupabaseUser();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link expired</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/forgot-password"
            className="text-primary text-sm underline underline-offset-4"
          >
            Request a new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
