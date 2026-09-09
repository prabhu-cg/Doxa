import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const MEMBERS = [
  {
    initials: "PS",
    name: "Priya Shah",
    email: "priya@acme.com",
    role: "Owner",
  },
  {
    initials: "JL",
    name: "Jordan Lee",
    email: "jordan@acme.com",
    role: "Admin",
  },
  { initials: "SO", name: "Sam Okafor", email: "sam@acme.com", role: "Member" },
  {
    initials: "MG",
    name: "Maria Garcia",
    email: "maria@acme.com",
    role: "Member",
  },
] as const;

const roleVariant = {
  Owner: "default",
  Admin: "secondary",
  Member: "outline",
} as const;

/**
 * Illustrates organisation membership and roles — not a literal current
 * screen, representative of the administration workflow Doxa is designed
 * to support.
 */
export function AdminPreview() {
  return (
    <Card size="sm" className="w-full max-w-md shadow-lg" aria-hidden="true">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>Acme Inc.</span>
          <Badge variant="secondary">4 members</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MEMBERS.map((member, index) => (
          <div key={member.name}>
            {index > 0 ? <Separator className="mb-3" /> : null}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  aria-hidden="true"
                >
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {member.email}
                  </p>
                </div>
              </div>
              <Badge variant={roleVariant[member.role]}>{member.role}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
