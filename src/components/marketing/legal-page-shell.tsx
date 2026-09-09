export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {lastUpdated ? (
        <p className="text-muted-foreground mt-2 text-sm">
          Last updated {lastUpdated}
        </p>
      ) : null}
      <div className="[&_p]:text-muted-foreground [&_ul]:text-muted-foreground mt-8 space-y-1 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
