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
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/why-doxa", label: "Why Doxa" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Doxa
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
      </div>
    </header>
  );
}
