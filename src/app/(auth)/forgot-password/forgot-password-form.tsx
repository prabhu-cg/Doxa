"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/features/auth/schema";
import { requestPasswordReset } from "@/features/auth/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = { email: string };

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: FormValues) {
    await requestPasswordReset(values);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-muted-foreground text-center text-sm">
        If an account exists for that email, we&apos;ve sent a link to reset the
        password.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        <Link href="/login" className="hover:text-foreground underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
