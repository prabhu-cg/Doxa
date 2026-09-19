/** Next.js renders this for the `@modal` slot on any hard navigation
 * (full page load / refresh) whose URL doesn't match one of the
 * intercepted routes below — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md.
 * Rendering nothing here is exactly right: those pages already render
 * themselves in full at their own route (e.g. `/org/[slug]/boards/new`),
 * so a direct link or a refresh always shows the real page, never the
 * drawer. */
export default function Default() {
  return null;
}
