import { describe, expect, it } from "vitest";
import { generateUniqueSlug, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Add Dark Mode")).toBe("add-dark-mode");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("Bug: crashes on iOS 17!")).toBe("bug-crashes-on-ios-17");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Weird--  ")).toBe("weird");
  });

  it("falls back to a placeholder for an empty result", () => {
    expect(slugify("!!!")).toBe("item");
  });

  it("truncates to 48 characters", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBe(48);
  });
});

describe("generateUniqueSlug", () => {
  it("returns the base slug when it's free", async () => {
    const result = await generateUniqueSlug("feature", async () => false);
    expect(result).toBe("feature");
  });

  it("appends a suffix on collision", async () => {
    const result = await generateUniqueSlug(
      "feature",
      async (candidate) => candidate === "feature",
    );
    expect(result).not.toBe("feature");
    expect(result.startsWith("feature-")).toBe(true);
  });

  it("eventually gives up and appends a timestamp if every attempt collides", async () => {
    const result = await generateUniqueSlug("feature", async () => true);
    expect(result.startsWith("feature-")).toBe(true);
  });
});
