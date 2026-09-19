import { describe, expect, it } from "vitest";
import {
  describeResponsiveness,
  summariseResponsiveness,
} from "./decision-stats";

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);
const noun = { singular: "Idea", plural: "Ideas" };

describe("summariseResponsiveness", () => {
  it("counts items and how many have a decision", () => {
    const summary = summariseResponsiveness([
      { createdAt: d("2024-01-01"), firstDecisionAt: d("2024-01-02") },
      { createdAt: d("2024-01-01"), firstDecisionAt: null },
    ]);
    expect(summary).toMatchObject({ total: 2, answered: 1 });
  });

  it("takes the median wait of the decided items (odd count)", () => {
    const summary = summariseResponsiveness([
      { createdAt: d("2024-01-01"), firstDecisionAt: d("2024-01-02") }, // 1
      { createdAt: d("2024-01-01"), firstDecisionAt: d("2024-01-11") }, // 10
      { createdAt: d("2024-01-01"), firstDecisionAt: d("2024-01-04") }, // 3
    ]);
    expect(summary.medianDays).toBe(3);
  });

  it("averages the two middle waits (even count)", () => {
    const summary = summariseResponsiveness([
      { createdAt: d("2024-01-01"), firstDecisionAt: d("2024-01-02") }, // 1
      { createdAt: d("2024-01-01"), firstDecisionAt: d("2024-01-04") }, // 3
    ]);
    expect(summary.medianDays).toBe(2);
  });

  it("has no median when nothing is decided", () => {
    const summary = summariseResponsiveness([
      { createdAt: d("2024-01-01"), firstDecisionAt: null },
    ]);
    expect(summary).toEqual({ total: 1, answered: 0, medianDays: null });
  });

  it("never reports a negative wait", () => {
    const summary = summariseResponsiveness([
      { createdAt: d("2024-01-05"), firstDecisionAt: d("2024-01-01") },
    ]);
    expect(summary.medianDays).toBe(0);
  });

  it("handles no items at all", () => {
    expect(summariseResponsiveness([])).toEqual({
      total: 0,
      answered: 0,
      medianDays: null,
    });
  });
});

describe("describeResponsiveness", () => {
  it("says nothing when there are no items", () => {
    expect(
      describeResponsiveness({ total: 0, answered: 0, medianDays: null }, noun),
    ).toBeNull();
  });

  it("is honest when nothing is decided yet", () => {
    expect(
      describeResponsiveness({ total: 4, answered: 0, medianDays: null }, noun),
    ).toBe("The team hasn't decided on any ideas yet.");
  });

  it("states the ratio and the usual wait, rounding the wait up", () => {
    expect(
      describeResponsiveness(
        { total: 15, answered: 12, medianDays: 2.3 },
        noun,
      ),
    ).toBe("The team has decided on 12 of 15 ideas, usually within 3 days.");
  });

  it("says a day, not 0 days or 1 days", () => {
    expect(
      describeResponsiveness({ total: 5, answered: 5, medianDays: 0.2 }, noun),
    ).toBe("The team has decided on 5 of 5 ideas, usually within 1 day.");
  });

  it("uses the singular for a single item", () => {
    expect(
      describeResponsiveness({ total: 1, answered: 1, medianDays: 1 }, noun),
    ).toBe("The team has decided on 1 of 1 idea, usually within 1 day.");
  });
});
