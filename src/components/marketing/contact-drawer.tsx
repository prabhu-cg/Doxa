"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ContactForm } from "@/components/marketing/contact-form";
import { cn } from "@/lib/utils";

const ContactDrawerContext = createContext<{ open: () => void } | null>(null);

/**
 * The one "Get in touch" drawer for the whole marketing site. Any Contact button
 * (the header's, a pricing plan's) opens this same drawer instead of each page
 * doing something different; the `/contact` page still exists for links,
 * search engines and people without JavaScript.
 */
export function ContactDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo(() => ({ open: () => setIsOpen(true) }), []);

  return (
    <ContactDrawerContext.Provider value={value}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Get in touch</SheetTitle>
            <SheetDescription>
              Questions about Doxa? Send us a message.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <ContactForm />
          </div>
        </SheetContent>
      </Sheet>
    </ContactDrawerContext.Provider>
  );
}

/** Opens the contact drawer; null outside the marketing layout. */
export function useContactDrawer() {
  return useContext(ContactDrawerContext);
}

/**
 * A button-styled link to the contact page that opens the drawer instead when
 * it can. It stays a real link, so it still reaches `/contact` without
 * JavaScript, and "open in a new tab" (cmd/ctrl/shift-click, middle click)
 * still does what the visitor asked for.
 */
export function ContactLinkButton({
  href = "/contact",
  variant,
  size,
  className,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> &
  VariantProps<typeof buttonVariants> & { href?: string }) {
  const drawer = useContactDrawer();

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        const modified =
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0;
        if (!drawer || modified || event.defaultPrevented) return;
        event.preventDefault();
        drawer.open();
      }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
