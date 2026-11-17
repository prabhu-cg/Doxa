/**
 * The page shape shared by About, Privacy and Terms: a desk ground, a small
 * header (soft badge, Newsreader title, a line beneath), then the whole
 * document in one white card with a hairline.
 */
export function LegalPageShell({
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <header>
          {eyebrow ? (
            <span className="bg-primary-soft text-primary-text mb-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="text-foreground text-4xl sm:text-5xl">{title}</h1>
          {subtitle ? (
            <p className="text-muted-foreground mt-3 text-base">{subtitle}</p>
          ) : null}
          {lastUpdated ? (
            <p className="text-muted-foreground mt-3 text-sm">
              Last updated {lastUpdated}
            </p>
          ) : null}
        </header>
        <div className="doc-card bg-card text-muted-foreground rounded-card [&_a]:text-primary-text [&_h2]:text-foreground mt-10 border p-6 text-sm leading-relaxed sm:p-8 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:no-underline [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-base [&_h2:first-child]:mt-0 [&_li+li]:mt-1.5 [&_p+p]:mt-3 [&_section+section]:mt-8 [&_section>h2]:mt-0 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </div>
  );
}
