import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Get started" };

export default function OnboardingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Doxa</CardTitle>
        <CardDescription>
          Tell us your name and set up your first organisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingForm />
      </CardContent>
    </Card>
  );
}
