"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changeMemberRole } from "@/features/organizations/actions";
import type { MembershipRole } from "@/generated/prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABELS: Record<MembershipRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export function MemberRoleControl({
  slug,
  membershipId,
  currentRole,
  assignableRoles,
}: {
  slug: string;
  membershipId: string;
  currentRole: MembershipRole;
  assignableRoles: MembershipRole[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(newRole: string | null) {
    if (!newRole) return;
    setPending(true);
    setError(null);
    const result = await changeMemberRole(
      slug,
      membershipId,
      newRole as MembershipRole,
    );
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Select
        value={currentRole}
        onValueChange={onChange}
        disabled={pending}
        items={Object.fromEntries(
          assignableRoles.map((role) => [role, ROLE_LABELS[role]]),
        )}
      >
        <SelectTrigger size="sm" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {assignableRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
