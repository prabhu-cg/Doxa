import { cn } from "@/lib/utils";

export function FeatureGrid({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  } as const;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        columnClasses[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}
