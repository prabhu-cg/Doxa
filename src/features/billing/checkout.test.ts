import { describe, expect, it } from "vitest";
import { planChangeBlockedReason } from "./checkout";

describe("planChangeBlockedReason", () => {
  it("blocks paid plans while Stripe isn't configured", () => {
    expect(planChangeBlockedReason("PRO", false)).toMatch(/aren't available/);
    expect(planChangeBlockedReason("BUSINESS", false)).toMatch(
      /aren't available/,
    );
  });

  it("allows paid plans once Stripe is configured", () => {
    expect(planChangeBlockedReason("PRO", true)).toBeNull();
    expect(planChangeBlockedReason("BUSINESS", true)).toBeNull();
  });

  it("always allows the Free plan, so an organisation can downgrade", () => {
    expect(planChangeBlockedReason("FREE", false)).toBeNull();
    expect(planChangeBlockedReason("FREE", true)).toBeNull();
  });
});
