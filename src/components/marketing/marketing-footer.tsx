import Link from "next/link";
import { DoxaLogo } from "@/components/doxa-logo";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          aria-label="Doxa home"
          className="justify-self-center md:justify-self-start"
        >
          <DoxaLogo tagline markClassName="size-8" />
        </Link>

        <p className="text-muted-foreground text-center text-sm">
          © {year} Doxa. Listen. Understand. Decide.
        </p>

        <nav
          className="flex items-center justify-center gap-5 text-sm md:justify-end"
          aria-label="Footer"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground underline-offset-4 transition-colors hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
