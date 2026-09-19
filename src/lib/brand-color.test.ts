import { describe, expect, it } from "vitest";
import {
  badgeColors,
  brandTokens,
  contrastRatio,
  monogram,
} from "./brand-color";

describe("brandTokens", () => {
  it("leaves a colour that already reads well on white alone", () => {
    const tokens = brandTokens("#c74504");
    expect(tokens?.primary).toBe("#c74504");
  });

  it("darkens a light accent until white text on it passes", () => {
    const tokens = brandTokens("#ffd400");
    expect(tokens).not.toBeNull();
    expect(contrastRatio(tokens!.primary, "#ffffff")).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("keeps the accent readable as text on its own tint", () => {
    for (const accent of [
      "#ffd400",
      "#3b82f6",
      "#22c55e",
      "#7c3aed",
      "#f97316",
    ]) {
      const tokens = brandTokens(accent)!;
      expect(
        contrastRatio(tokens.primaryText, tokens.primarySoft),
      ).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens.primary, "#ffffff")).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it("accepts a hex with or without the hash, and ignores anything else", () => {
    expect(brandTokens("c74504")?.primary).toBe("#c74504");
    expect(brandTokens("red")).toBeNull();
    expect(brandTokens("#fff")).toBeNull();
    expect(brandTokens("#c74504; } body { display: none")).toBeNull();
    expect(brandTokens(null)).toBeNull();
    expect(brandTokens("")).toBeNull();
  });
});

describe("monogram", () => {
  it("uses the first letters of the first two words", () => {
    expect(monogram("Acme Robotics Inc")).toBe("AR");
  });

  it("uses two letters of a single word", () => {
    expect(monogram("acme")).toBe("AC");
  });

  it("never comes back empty", () => {
    expect(monogram("   ")).toBe("?");
  });
});

describe("badgeColors", () => {
  it("makes the text readable on its own tint, whatever the colour", () => {
    for (const color of [
      "#f59e0b",
      "#94a3b8",
      "#eab308",
      "#78716c",
      "#3b82f6",
      "#22c55e",
    ]) {
      const badge = badgeColors(color)!;
      expect(
        contrastRatio(badge.color, badge.background),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("has nothing to say about a missing or invalid colour", () => {
    expect(badgeColors(null)).toBeUndefined();
    expect(badgeColors("amber")).toBeUndefined();
  });
});
