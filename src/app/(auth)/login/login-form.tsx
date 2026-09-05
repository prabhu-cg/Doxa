"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/features/auth/schema";
import { signIn } from "@/features/auth/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = { email: string; password: string };

export function LoginForm({ next }: { next?: string }) {
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await signIn({ ...values, next });
    if (!result.success) setRootError(result.error);
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
      <FormField
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
      </FormField>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
      <div className="text-muted-foreground flex justify-between text-sm">
        <Link
          href="/forgot-password"
          className="hover:text-foreground underline"
        >
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-foreground underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}
