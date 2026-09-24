"use client";

import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Drawer } from "@/components/drawer";
import { ProfileForm } from "@/app/profile/profile-form";

export function UserMenu({
  displayName,
  username,
}: {
  displayName: string;
  username: string | null;
}) {
  const initials = displayName.trim().slice(0, 2).toUpperCase() || "?";
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="focus-visible:ring-ring/50 rounded-full outline-none focus-visible:ring-3"
              aria-label="Account menu"
            >
              <Avatar className="size-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">
              {displayName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <User className="size-4" />
              Profile settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              void signOut();
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* `/profile` stays as the full page for direct loads; from the app the
        same form opens over whatever page you're on. */}
      <Drawer
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title="Profile settings"
        description="How you appear to others in Doxa."
      >
        <ProfileForm
          initialDisplayName={displayName}
          initialUsername={username ?? ""}
        />
      </Drawer>
    </>
  );
}
