import Link from "next/link";
import { requireCurrentProfile } from "@/features/profile/queries";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCurrentProfile();

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center px-6 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Doxa
        </Link>
      </header>
      <main className="flex flex-1 justify-center px-4 pb-16">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
