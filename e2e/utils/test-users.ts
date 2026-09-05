import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

// Raw `pg` for test fixture setup/teardown — deliberately not the
// generated Prisma client (@/generated/prisma/client), which is ESM-only
// and Playwright's test transform can't load it (CommonJS-based, unlike
// Next.js's bundler). Using `pg` directly here is test-only scaffolding,
// not an app architecture change.
async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL! });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export const TEST_PASSWORD = "Test-password-123!";

/**
 * Admin-provisions a pre-confirmed user for e2e tests, bypassing real
 * email delivery. Production signup still goes through Supabase's normal
 * email-confirmation flow — this is a test-only shortcut using the
 * service-role key, never exposed to the app itself.
 */
export async function createConfirmedTestUser() {
  const email = `doxa-e2e+${randomUUID()}@example.com`;
  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  return { id: data.user.id, email, password: TEST_PASSWORD };
}

/**
 * Deletes the auth user and its profile/memberships. There's no DB-level
 * cascade from auth.users to profiles (see prisma/schema.prisma) so both
 * must be cleaned up explicitly.
 */
export async function deleteTestUser(userId: string) {
  await withClient((client) =>
    client.query(`DELETE FROM "profiles" WHERE "id" = $1`, [userId]),
  );
  const supabase = adminClient();
  await supabase.auth.admin.deleteUser(userId);
}

export async function deleteTestOrganization(slug: string) {
  await withClient((client) =>
    client.query(`DELETE FROM "organizations" WHERE "slug" = $1`, [slug]),
  );
}

/** Creates an org with `userId` as its OWNER, bypassing the UI. */
export async function createTestOrganizationForUser(
  userId: string,
  name: string,
) {
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomUUID().slice(0, 8)}`;
  const orgId = randomUUID();

  await withClient(async (client) => {
    await client.query(
      `INSERT INTO "organizations" ("id", "name", "slug", "updatedAt") VALUES ($1, $2, $3, now())`,
      [orgId, name, slug],
    );
    await client.query(
      `INSERT INTO "memberships" ("id", "organizationId", "userId", "role") VALUES ($1, $2, $3, 'OWNER')`,
      [randomUUID(), orgId, userId],
    );
  });

  return { id: orgId, slug, name };
}
