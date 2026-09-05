import Link from "next/link";
import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A styled-as-button navigation link. Deliberately NOT `<Button
 * render={<Link>} />` — Base UI's Button always exposes `role="button"`
 * on whatever it renders, even an `<a>`, which is the wrong accessible
 * semantics for a control that navigates to a new page (it should read as
 * a link to assistive tech). This renders a plain `<Link>` styled with
 * the same variants, so the accessible role matches what it actually does.
 */
export function LinkButton({
  href,
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
