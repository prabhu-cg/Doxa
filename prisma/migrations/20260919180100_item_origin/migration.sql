-- CreateEnum
CREATE TYPE "ItemOrigin" AS ENUM ('TEAM', 'COMMUNITY');

-- AlterTable
ALTER TABLE "items" ADD COLUMN "origin" "ItemOrigin" NOT NULL DEFAULT 'TEAM';
