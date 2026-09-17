-- CreateEnum
CREATE TYPE "PlanKey" AS ENUM ('FREE', 'PRO', 'BUSINESS');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "AuditLogAction" AS ENUM ('MEMBER_ADDED', 'MEMBER_REMOVED', 'MEMBER_ROLE_CHANGED', 'ORGANIZATION_UPDATED', 'BRANDING_UPDATED', 'BOARD_CREATED', 'BOARD_ARCHIVED', 'BOARD_RESTORED', 'DECISION_RECORDED', 'PLAN_CHANGED');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "itemTerminologyPlural" TEXT NOT NULL DEFAULT 'Items',
ADD COLUMN     "itemTerminologySingular" TEXT NOT NULL DEFAULT 'Item',
ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "key" "PlanKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxOrganizations" INTEGER,
    "maxMembers" INTEGER,
    "maxBoards" INTEGER,
    "maxItems" INTEGER,
    "maxStorageMb" INTEGER,
    "advancedPrioritisation" BOOLEAN NOT NULL DEFAULT false,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "branding" BOOLEAN NOT NULL DEFAULT false,
    "apiAccess" BOOLEAN NOT NULL DEFAULT false,
    "integrations" BOOLEAN NOT NULL DEFAULT false,
    "priceMonthlyCents" INTEGER,
    "priceYearlyCents" INTEGER,
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdYearly" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "billingEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "billingPeriod" "BillingPeriod" NOT NULL DEFAULT 'MONTHLY',
    "stripeSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorId" UUID,
    "action" "AuditLogAction" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_key_key" ON "plans"("key");

-- CreateIndex
CREATE UNIQUE INDEX "customers_organizationId_key" ON "customers"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_stripeCustomerId_key" ON "customers"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_organizationId_key" ON "subscriptions"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_customerId_key" ON "subscriptions"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_createdAt_idx" ON "audit_logs"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed the three global Plan rows. Values here must match
-- features/billing/defaults.ts (DEFAULT_PLANS), the source of truth
-- application code reads seed data from for anything beyond this
-- one-time backfill (e.g. re-seeding in tests).
INSERT INTO "plans" ("id", "key", "name", "description", "maxOrganizations", "maxMembers", "maxBoards", "maxItems", "maxStorageMb", "advancedPrioritisation", "analytics", "branding", "apiAccess", "integrations", "priceMonthlyCents", "priceYearlyCents", "sortOrder", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'FREE', 'Free', 'For small teams trying Doxa out.', 1, 5, 3, 100, 100, false, false, false, false, false, 0, 0, 0, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'PRO', 'Pro', 'For growing teams that need real prioritisation.', 5, 25, 20, 2000, 5000, true, true, true, false, true, 1900, 19000, 1, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'BUSINESS', 'Business', 'For organisations running Doxa at scale.', NULL, NULL, NULL, NULL, 50000, true, true, true, true, true, 9900, 99000, 2, CURRENT_TIMESTAMP);

-- Backfill: every pre-existing organisation gets a Customer and a
-- Subscription on FREE, exactly like a newly-created one does going
-- forward (see features/organizations/actions.ts) — "retaining a useful
-- free tier" means no pre-existing organisation is ever left without a
-- plan.
INSERT INTO "customers" ("id", "organizationId", "updatedAt")
SELECT gen_random_uuid()::text, "id", CURRENT_TIMESTAMP
FROM "organizations";

INSERT INTO "subscriptions" ("id", "organizationId", "customerId", "planId", "updatedAt")
SELECT gen_random_uuid()::text, c."organizationId", c."id", p."id", CURRENT_TIMESTAMP
FROM "customers" c
CROSS JOIN (SELECT "id" FROM "plans" WHERE "key" = 'FREE') p;
