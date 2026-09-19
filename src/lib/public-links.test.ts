import { describe, expect, it } from "vitest";
import {
  publicBoardPath,
  publicItemPath,
  publicRoadmapPath,
} from "./public-links";

describe("public link paths", () => {
  it("builds a board's public path", () => {
    expect(publicBoardPath("guest-org", "feature-requests")).toBe(
      "/b/guest-org/feature-requests",
    );
  });

  it("builds an item's public path under its board", () => {
    expect(
      publicItemPath("guest-org", "feature-requests", "slack-notifications"),
    ).toBe("/b/guest-org/feature-requests/slack-notifications");
  });

  it("builds an organisation's public roadmap path outside /b/", () => {
    expect(publicRoadmapPath("guest-org")).toBe("/r/guest-org");
  });
});
