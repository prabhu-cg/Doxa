import { describe, expect, it } from "vitest";
import { cn, formatRelativeTime } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-09-19T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  it("reads sub-minute differences as just now", () => {
    expect(formatRelativeTime(ago(20_000), now)).toBe("just now");
  });

  it("picks the largest whole unit", () => {
    expect(formatRelativeTime(ago(5 * MINUTE), now)).toBe("5 minutes ago");
    expect(formatRelativeTime(ago(3 * HOUR), now)).toBe("3 hours ago");
    expect(formatRelativeTime(ago(3 * DAY), now)).toBe("3 days ago");
    expect(formatRelativeTime(ago(210 * DAY), now)).toBe("7 months ago");
  });

  it("uses natural wording for adjacent periods", () => {
    expect(formatRelativeTime(ago(DAY), now)).toBe("yesterday");
  });
});
