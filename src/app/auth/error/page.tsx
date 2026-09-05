import type { Metadata } from "next";
import { LinkButton } from "@/components/link-button";

export const metadata: Metadata = { title: "Authentication error" };

export default function AuthErrorPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        That link is invalid or has expired. Try signing in again, or request a
        new link.
      </p>
      <LinkButton href="/login">Back to sign in</LinkButton>
    </main>
  );
}
