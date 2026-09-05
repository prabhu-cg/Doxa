import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Doxa account and start free.",
};

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start collecting and prioritising feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
