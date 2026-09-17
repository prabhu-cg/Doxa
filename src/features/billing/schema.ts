import { z } from "zod";

export const PLAN_KEYS = ["FREE", "PRO", "BUSINESS"] as const;
export const BILLING_PERIODS = ["MONTHLY", "YEARLY"] as const;

export const changePlanSchema = z.object({
  planKey: z.enum(PLAN_KEYS),
  billingPeriod: z.enum(BILLING_PERIODS).default("MONTHLY"),
});
