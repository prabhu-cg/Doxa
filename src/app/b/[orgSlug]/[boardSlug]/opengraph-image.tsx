import { ImageResponse } from "next/og";
import { getVisibleBoard } from "@/features/boards/queries";
import { brandTokens, monogram } from "@/lib/brand-color";

export const alt = "Feedback board";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DOXA_TERRACOTTA = "#c74504";

/**
 * The card a shared link shows in chat and social apps: the organisation's
 * monogram and accent, its name, and the board. Drawn from text and colour only —
 * never by fetching the organisation's logo URL, which is a value someone pasted
 * and not something the server should be made to request.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string }>;
}) {
  const { orgSlug, boardSlug } = await params;
  const visible = await getVisibleBoard(orgSlug, boardSlug);
  const orgName = visible?.organization.name ?? "Feedback board";
  const boardName = visible?.board.name ?? "Feedback";
  const description = visible?.board.description ?? null;
  const accent =
    brandTokens(visible?.organization.accentColor)?.primary ?? DOXA_TERRACOTTA;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#fffaef",
        borderTop: `14px solid ${accent}`,
        color: "#1c1917",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 20,
            background: accent,
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          {monogram(orgName)}
        </div>
        <div style={{ fontSize: 40, fontWeight: 700 }}>{orgName}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {boardName}
        </div>
        {description ? (
          <div
            style={{
              fontSize: 32,
              color: "#78716c",
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            {description.length > 130
              ? `${description.slice(0, 127)}…`
              : description}
          </div>
        ) : (
          <div style={{ fontSize: 32, color: "#78716c" }}>
            Vote on what matters and see how we respond.
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          fontSize: 24,
          color: "#78716c",
        }}
      >
        Powered by Doxa
      </div>
    </div>,
    { ...size },
  );
}
