import { describe, expect, it } from "vitest";
import { authPath, safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("keeps a path inside the app", () => {
    expect(safeNextPath("/b/acme/ideas/dark-mode", "/app")).toBe(
      "/b/acme/ideas/dark-mode",
    );
  });

  it("falls back when there is nothing to follow", () => {
    expect(safeNextPath(undefined, "/app")).toBe("/app");
    expect(safeNextPath(null, "/app")).toBe("/app");
    expect(safeNextPath("", "/app")).toBe("/app");
  });

  it("never follows another site", () => {
    expect(safeNextPath("https://evil.example", "/app")).toBe("/app");
    expect(safeNextPath("//evil.example", "/app")).toBe("/app");
  });
});

describe("authPath", () => {
  it("carries the page to come back to", () => {
    expect(authPath("login", "/b/acme/ideas?sort=most-voted")).toBe(
      "/login?next=%2Fb%2Facme%2Fideas%3Fsort%3Dmost-voted",
    );
  });

  it("is the plain page when there is nowhere to go back to", () => {
    expect(authPath("signup", undefined)).toBe("/signup");
    expect(authPath("signup", "https://evil.example")).toBe("/signup");
  });
});
