import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <Badge variant="secondary">Phase 0 · Foundation</Badge>
      <h1 className="text-4xl font-extrabold tracking-tight text-balance">
        Doxa
      </h1>
      <p className="text-muted-foreground max-w-md text-balance">
        Collect, discuss, understand, prioritise, decide and communicate.
        Product functionality begins in Phase 1.
      </p>
    </main>
  );
}
