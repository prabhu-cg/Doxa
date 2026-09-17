/**
 * Re-applies DEFAULT_PLANS (src/features/billing/defaults.ts) to the
 * three global Plan rows — the mechanism for "exact commercial limits
 * should be configurable" without an application code change: edit
 * DEFAULT_PLANS, run `pnpm db:seed-plans`, done. Upserts by `key`, so
 * running it repeatedly is safe and never creates duplicate rows or
 * touches Customer/Subscription data.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEFAULT_PLANS } from "../src/features/billing/defaults";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const db = new PrismaClient({ adapter });

  for (const plan of DEFAULT_PLANS) {
    await db.plan.upsert({
      where: { key: plan.key },
      create: plan,
      update: plan,
    });
    console.log(`[seed-plans] upserted ${plan.key}`);
  }

  await db.$disconnect();
}

main().catch((error) => {
  console.error("[seed-plans] failed:", error);
  process.exit(1);
});
