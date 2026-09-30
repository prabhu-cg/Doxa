import { describe, expect, it } from "vitest";
import { LOGO_MAX_BYTES, logoFileError } from "./schema";

describe("logoFileError", () => {
  it("accepts the image types a logo can be", () => {
    for (const type of [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ]) {
      expect(logoFileError({ type, size: 1024 })).toBeNull();
    }
  });

  it("rejects anything that isn't one of those", () => {
    expect(logoFileError({ type: "image/gif", size: 1024 })).not.toBeNull();
    expect(logoFileError({ type: "text/html", size: 1024 })).not.toBeNull();
    expect(logoFileError({ type: "", size: 1024 })).not.toBeNull();
  });

  it("rejects an empty file and one over the limit", () => {
    expect(logoFileError({ type: "image/png", size: 0 })).not.toBeNull();
    expect(
      logoFileError({ type: "image/png", size: LOGO_MAX_BYTES }),
    ).toBeNull();
    expect(
      logoFileError({ type: "image/png", size: LOGO_MAX_BYTES + 1 }),
    ).not.toBeNull();
  });
});
