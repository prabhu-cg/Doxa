import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <Link
          href="/"
          aria-label="Doxa home"
          className="flex items-center gap-3"
        >
          <img src="/doxa-logo.svg" alt="" className="h-9 w-auto shrink-0" />
          <span className="text-base font-bold tracking-tight">Doxa</span>
        </Link>

        <p className="text-muted-foreground text-center text-sm">
          © {year} Doxa. Listen. Understand. Decide.
        </p>

        <nav className="flex items-center gap-5 text-sm" aria-label="Footer">
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
