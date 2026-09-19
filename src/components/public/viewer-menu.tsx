import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import type { Viewer } from "@/features/participation/access";
import { SignInLinks } from "./sign-in-links";
import { Button } from "@/components/ui/button";

/** Who is signed in, or the way to sign in — at the right of the top bar. */
export function ViewerMenu({ viewer }: { viewer: Viewer }) {
  if (viewer.status === "anonymous") return <SignInLinks />;
  const { displayName } = viewer.profile;
  return (
    <form action={signOut} className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="bg-primary-soft text-primary-text flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      >
        {displayName.slice(0, 1).toUpperCase()}
      </span>
      <span className="hidden max-w-[10rem] truncate text-sm font-medium md:block">
        {displayName}
      </span>
      <Button type="submit" variant="ghost" size="sm" aria-label="Sign out">
        <LogOut />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </form>
  );
}
