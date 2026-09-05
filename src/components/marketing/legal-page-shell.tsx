export function LegalPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <div className="border-border bg-muted/50 mt-6 rounded-lg border px-4 py-3 text-sm">
        <strong>TODO:</strong> this page is a structured placeholder. Final text
        needs legal review before Doxa is used in production with real customer
        data.
      </div>
      <div className="[&_p]:text-muted-foreground [&_ul]:text-muted-foreground mt-8 space-y-1 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
