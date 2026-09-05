// Prisma CLI configuration (migrate, generate, studio). Secrets live in
// `.env.local` (Next.js convention, gitignored) rather than `.env` — see
// docs/environment.md for the full variable reference.
import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Prisma 7's config datasource has no `directUrl` field — this `url` is
  // only used by the CLI (migrate/introspect/studio), which needs the
  // non-pooled connection. The app itself connects at runtime through the
  // @prisma/adapter-pg adapter in src/server/db.ts, using the pooled
  // DATABASE_URL. See docs/environment.md.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
