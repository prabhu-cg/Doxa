import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ItemCard({
  href,
  title,
  description,
  itemTypeName,
  statusName,
  statusColor,
  categoryName,
  tagNames,
  authorName,
  voteCount,
  commentCount,
  archived,
}: {
  href: string;
  title: string;
  description?: string | null;
  itemTypeName: string;
  statusName: string;
  statusColor?: string | null;
  categoryName?: string | null;
  tagNames: string[];
  authorName: string;
  voteCount: number;
  commentCount: number;
  archived?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>
            <Link href={href}>{title}</Link>
          </CardTitle>
          <Badge variant="outline">{itemTypeName}</Badge>
          <Badge
            variant="secondary"
            style={
              statusColor
                ? { backgroundColor: `${statusColor}22`, color: statusColor }
                : undefined
            }
          >
            {statusName}
          </Badge>
          {categoryName ? (
            <Badge variant="outline">{categoryName}</Badge>
          ) : null}
          {archived ? <Badge variant="secondary">Archived</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {description ? (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {description}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-xs">by {authorName}</span>
          <span className="text-muted-foreground text-xs">
            · {voteCount} {voteCount === 1 ? "vote" : "votes"}
          </span>
          <span className="text-muted-foreground text-xs">
            · {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </span>
          {tagNames.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
