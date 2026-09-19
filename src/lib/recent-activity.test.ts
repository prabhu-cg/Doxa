import { describe, expect, it } from "vitest";
import { byRecentActivity } from "./recent-activity";

const card = (id: string, created: string, activity: string) => ({
  id,
  createdAt: new Date(created),
  lastActivityAt: new Date(activity),
});

describe("byRecentActivity", () => {
  it("puts the most recently touched card first", () => {
    const cards = [
      card("a", "2024-01-01", "2024-01-01"),
      card("b", "2024-02-01", "2024-02-01"),
      card("c", "2024-03-01", "2024-03-01"),
    ];
    expect(cards.sort(byRecentActivity).map((c) => c.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("lets an old card that was edited recently lead a newer, untouched one", () => {
    const cards = [
      card("new-untouched", "2024-06-01", "2024-06-01"),
      card("old-edited", "2024-01-01", "2024-07-01"),
    ];
    expect(cards.sort(byRecentActivity).map((c) => c.id)).toEqual([
      "old-edited",
      "new-untouched",
    ]);
  });

  it("breaks a tie in activity by the newer card", () => {
    const cards = [
      card("older", "2024-01-01", "2024-05-01"),
      card("newer", "2024-02-01", "2024-05-01"),
    ];
    expect(cards.sort(byRecentActivity).map((c) => c.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("breaks a full tie by id so the order is stable", () => {
    const same = ["2024-05-01", "2024-05-01"] as const;
    const cards = [card("a", ...same), card("b", ...same)];
    expect(cards.sort(byRecentActivity).map((c) => c.id)).toEqual(["b", "a"]);
    expect(
      [...cards]
        .reverse()
        .sort(byRecentActivity)
        .map((c) => c.id),
    ).toEqual(["b", "a"]);
  });
});
