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

/** Creates an org with `userId` as its OWNER, bypassing the UI. Also
 * creates a Customer + Subscription on FREE, exactly like the real
 * createOrganization/completeOnboarding Server Actions do (Phase 5) —
 * without it, any Server Action that resolves the org's plan
 * (features/entitlements/queries.ts#getPlanForOrganization, called from
 * createBoard/createItem) would throw on an org created this way. */
export async function createTestOrganizationForUser(
  userId: string,
  name: string,
) {
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomUUID().slice(0, 8)}`;
  const orgId = randomUUID();
  const customerId = randomUUID();

  await withClient(async (client) => {
    await client.query(
      `INSERT INTO "organizations" ("id", "name", "slug", "updatedAt") VALUES ($1, $2, $3, now())`,
      [orgId, name, slug],
    );
    await client.query(
      `INSERT INTO "memberships" ("id", "organizationId", "userId", "role") VALUES ($1, $2, $3, 'OWNER')`,
      [randomUUID(), orgId, userId],
    );
    const { rows } = await client.query(
      `SELECT "id" FROM "plans" WHERE "key" = 'FREE'`,
    );
    const freePlanId = rows[0]?.id;
    await client.query(
      `INSERT INTO "customers" ("id", "organizationId", "updatedAt") VALUES ($1, $2, now())`,
      [customerId, orgId],
    );
    await client.query(
      `INSERT INTO "subscriptions" ("id", "organizationId", "customerId", "planId", "updatedAt") VALUES ($1, $2, $3, $4, now())`,
      [randomUUID(), orgId, customerId, freePlanId],
    );
  });

  return { id: orgId, slug, name };
}

/** Deleting the organization cascades to every Phase 2 table (Space,
 * Board, ItemType, Status, Category, Tag, Item, ItemTag) — verified this
 * resolves correctly even with Item's non-cascading FKs to ItemType/Status
 * in the mix (see the note at the top of prisma/schema.prisma). */
export async function deleteTestOrganizationById(organizationId: string) {
  await withClient((client) =>
    client.query(`DELETE FROM "organizations" WHERE "id" = $1`, [
      organizationId,
    ]),
  );
}

/** Sets a test user's username directly — onboarding doesn't collect one
 * (see README's "Assumptions made"), but @mention resolution needs it. */
export async function setTestUsername(userId: string, username: string) {
  await withClient((client) =>
    client.query(`UPDATE "profiles" SET "username" = $1 WHERE "id" = $2`, [
      username,
      userId,
    ]),
  );
}

/** Adds an existing user to an org bypassing the UI — there's no
 * invitation flow yet (see docs/architecture.md), so tests that need a
 * second member go straight to the membership table. */
export async function addTestMembership(
  organizationId: string,
  userId: string,
  role: "OWNER" | "ADMIN" | "MEMBER" = "MEMBER",
) {
  await withClient((client) =>
    client.query(
      `INSERT INTO "memberships" ("id", "organizationId", "userId", "role") VALUES ($1, $2, $3, $4)`,
      [randomUUID(), organizationId, userId, role],
    ),
  );
}

function slugFrom(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export async function createTestSpace(organizationId: string, name: string) {
  const id = randomUUID();
  const slug = `${slugFrom(name)}-${randomUUID().slice(0, 6)}`;
  await withClient((client) =>
    client.query(
      `INSERT INTO "spaces" ("id", "organizationId", "name", "slug", "updatedAt") VALUES ($1, $2, $3, $4, now())`,
      [id, organizationId, name, slug],
    ),
  );
  return { id, slug, name };
}

export async function createTestBoard(
  organizationId: string,
  spaceId: string,
  name: string,
  options: {
    visibility?: "PUBLIC" | "PRIVATE";
    status?: "ACTIVE" | "ARCHIVED";
  } = {},
) {
  const id = randomUUID();
  const slug = `${slugFrom(name)}-${randomUUID().slice(0, 6)}`;
  await withClient((client) =>
    client.query(
      `INSERT INTO "boards" ("id", "organizationId", "spaceId", "name", "slug", "visibility", "status", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
      [
        id,
        organizationId,
        spaceId,
        name,
        slug,
        options.visibility ?? "PRIVATE",
        options.status ?? "ACTIVE",
      ],
    ),
  );
  return { id, slug, name };
}

export async function createTestItemType(organizationId: string, name: string) {
  const id = randomUUID();
  const slug = `${slugFrom(name)}-${randomUUID().slice(0, 6)}`;
  await withClient((client) =>
    client.query(
      `INSERT INTO "item_types" ("id", "organizationId", "name", "slug", "updatedAt") VALUES ($1, $2, $3, $4, now())`,
      [id, organizationId, name, slug],
    ),
  );
  return { id, slug, name };
}

export async function createTestStatus(
  organizationId: string,
  name: string,
  isDefault = false,
) {
  const id = randomUUID();
  const slug = `${slugFrom(name)}-${randomUUID().slice(0, 6)}`;
  await withClient((client) =>
    client.query(
      `INSERT INTO "statuses" ("id", "organizationId", "name", "slug", "isDefault", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, now())`,
      [id, organizationId, name, slug, isDefault],
    ),
  );
  return { id, slug, name };
}

export async function createTestPriority(
  organizationId: string,
  name: string,
  isDefault = false,
) {
  const id = randomUUID();
  const slug = `${slugFrom(name)}-${randomUUID().slice(0, 6)}`;
  await withClient((client) =>
    client.query(
      `INSERT INTO "priorities" ("id", "organizationId", "name", "slug", "isDefault", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, now())`,
      [id, organizationId, name, slug, isDefault],
    ),
  );
  return { id, slug, name };
}

export async function createTestItem(params: {
  organizationId: string;
  spaceId: string;
  boardId: string;
  itemTypeId: string;
  statusId: string;
  priorityId: string;
  authorId: string;
  title: string;
  archivedAt?: Date;
}) {
  const id = randomUUID();
  const slug = `${slugFrom(params.title)}-${randomUUID().slice(0, 6)}`;
  await withClient((client) =>
    client.query(
      `INSERT INTO "items"
        ("id", "organizationId", "spaceId", "boardId", "itemTypeId", "statusId", "priorityId", "authorId", "title", "slug", "archivedAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())`,
      [
        id,
        params.organizationId,
        params.spaceId,
        params.boardId,
        params.itemTypeId,
        params.statusId,
        params.priorityId,
        params.authorId,
        params.title,
        slug,
        params.archivedAt ?? null,
      ],
    ),
  );
  return { id, slug, title: params.title };
}
