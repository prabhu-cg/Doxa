-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', 'DEFERRED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "RoadmapStage" AS ENUM ('NOW', 'NEXT', 'LATER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'PRIORITY_CHANGED';
ALTER TYPE "ActivityType" ADD VALUE 'DECISION_RECORDED';

-- CreateTable
CREATE TABLE "priorities" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_criteria" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "score_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_scores" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "DecisionType" NOT NULL,
    "rationale" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "internalNotes" TEXT,
    "roadmapStage" "RoadmapStage",
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "priorities_organizationId_slug_key" ON "priorities"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "score_criteria_organizationId_slug_key" ON "score_criteria"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "item_scores_itemId_criterionId_key" ON "item_scores"("itemId", "criterionId");

-- CreateIndex
CREATE INDEX "decisions_itemId_createdAt_idx" ON "decisions"("itemId", "createdAt");

-- AddForeignKey
ALTER TABLE "priorities" ADD CONSTRAINT "priorities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_criteria" ADD CONSTRAINT "score_criteria_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_scores" ADD CONSTRAINT "item_scores_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_scores" ADD CONSTRAINT "item_scores_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "score_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: every pre-existing organisation gets the same five default
-- Priority levels a newly-created organisation gets (see
-- features/priorities/defaults.ts), before items.priorityId can be made
-- required, so no existing Item is ever left without one.
INSERT INTO "priorities" ("id", "organizationId", "name", "slug", "color", "sortOrder", "isDefault", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, o."id", v."name", v."slug", v."color", v."sortOrder", v."isDefault", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "organizations" o
CROSS JOIN (
  VALUES
    ('None', 'none', '#94a3b8', 0, true),
    ('Low', 'low', '#60a5fa', 1, false),
    ('Medium', 'medium', '#f59e0b', 2, false),
    ('High', 'high', '#f97316', 3, false),
    ('Critical', 'critical', '#ef4444', 4, false)
) AS v("name", "slug", "color", "sortOrder", "isDefault");

-- AlterTable
ALTER TABLE "items" ADD COLUMN "priorityId" TEXT;

UPDATE "items" i
SET "priorityId" = p."id"
FROM "priorities" p
WHERE p."organizationId" = i."organizationId" AND p."slug" = 'none';

ALTER TABLE "items" ALTER COLUMN "priorityId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "priorities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
