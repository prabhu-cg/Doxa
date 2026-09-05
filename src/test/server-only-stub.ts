// Vitest alias target for "server-only" (see vitest.config.ts).
//
// The real "server-only" package unconditionally throws when imported —
// Next.js's bundler swaps it for a no-op specifically in server
// compilation graphs, but Vitest has no such distinction. Tests run in
// Node, never in a browser, so the guard's purpose (stop a secret from
// reaching a client bundle) doesn't apply here; this stub keeps the
// import working without weakening the real guard in the actual app
// build.
export {};
