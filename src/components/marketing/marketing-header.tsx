"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/link-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ContactForm } from "@/components/marketing/contact-form";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/why-doxa", label: "Why Doxa" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Doxa home" className="flex items-center gap-3">
          <img src="/doxa-logo.svg" alt="" className="h-9 w-auto shrink-0" />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="text-base font-bold tracking-tight">Doxa</span>
            <span className="text-muted-foreground mt-1 truncate text-[11px] font-medium">
              Listen. Understand. Decide.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            Contact
          </button>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LinkButton variant="ghost" href="/login">
            Log in
          </LinkButton>
          <LinkButton href="/signup">Start Free</LinkButton>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Doxa</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="hover:bg-muted rounded-md px-3 py-2.5 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setContactOpen(true);
                }}
                className="hover:bg-muted rounded-md px-3 py-2.5 text-left text-sm font-medium"
              >
                Contact
              </button>
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t px-4 pt-4">
              <LinkButton
                variant="outline"
                href="/login"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </LinkButton>
              <LinkButton href="/signup" onClick={() => setMobileOpen(false)}>
                Start Free
              </LinkButton>
            </div>
          </SheetContent>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </Sheet>

        <Sheet open={contactOpen} onOpenChange={setContactOpen}>
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
      </div>
    </header>
  );
}
