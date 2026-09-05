"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/server/supabase/server-client";
import { clientEnv } from "@/lib/env/client";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function signUp(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult & { status?: "check-email" }> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding`,
    },
  });
  if (error) return { success: false, error: error.message };

  // With "Confirm email" enabled (the default), signUp creates the user
  // but no session — the real session starts once they click the email
  // link and /auth/callback exchanges the code. Without email
  // confirmation required, a session comes back immediately.
  if (data.session) {
    redirect("/onboarding");
  }
  return { success: true, status: "check-email" };
}

/** Only ever redirect to a same-app relative path — never follow an
 * externally-supplied `next` value as-is, or it becomes an open redirect. */
function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export async function signIn(input: {
  email: string;
  password: string;
  next?: string;
}): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { success: false, error: "Invalid email or password" };

  redirect(safeNextPath(input.next));
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(input: {
  email: string;
}): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    },
  );
  // Never reveal whether the address has an account — same response
  // either way. Log server-side only.
  if (error) console.error("resetPasswordForEmail failed:", error.message);
  return { success: true };
}

export async function updatePassword(input: {
  password: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { success: false, error: error.message };

  redirect("/");
}
