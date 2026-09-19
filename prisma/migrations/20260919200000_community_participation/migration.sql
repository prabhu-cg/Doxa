-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ITEM_SUBMITTED';

-- AlterTable
ALTER TABLE "boards" ADD COLUMN "requireApproval" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "items" ADD COLUMN "awaitingReview" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "participant_blocks" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "blockedById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participant_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participant_blocks_organizationId_userId_key" ON "participant_blocks"("organizationId", "userId");

-- AddForeignKey
ALTER TABLE "participant_blocks" ADD CONSTRAINT "participant_blocks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_blocks" ADD CONSTRAINT "participant_blocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_blocks" ADD CONSTRAINT "participant_blocks_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
