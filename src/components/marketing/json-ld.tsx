/**
 * Renders a schema.org JSON-LD block. Server-rendered, no client JS.
 * `data` should only ever describe content that actually appears on the
 * page it's rendered on — never fabricated facts.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
