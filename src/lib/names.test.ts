import { describe, expect, it } from "vitest";
import {
  NAME_RACE_MESSAGE,
  nameTakenMessage,
  otherThan,
  restoreBlockedMessage,
  sameName,
} from "./names";

describe("sameName", () => {
  it("matches the name ignoring case", () => {
    expect(sameName("Bug")).toEqual({ equals: "Bug", mode: "insensitive" });
  });
});

describe("otherThan", () => {
  it("excludes the given row", () => {
    expect(otherThan("abc")).toEqual({ id: { not: "abc" } });
  });

  it("adds no condition when there is no row to exclude", () => {
    expect(otherThan()).toEqual({});
  });
});

describe("nameTakenMessage", () => {
  it("names the kind and the taken name", () => {
    expect(nameTakenMessage("space", "Product")).toBe(
      'Space "Product" already exists',
    );
  });

  it("capitalises multi-word kinds", () => {
    expect(nameTakenMessage("item type", "Bug")).toBe(
      'Item type "Bug" already exists',
    );
  });

  it("narrows the scope when given one", () => {
    expect(nameTakenMessage("board", "Ideas", "in this space")).toBe(
      'Board "Ideas" already exists in this space',
    );
  });
});

describe("restoreBlockedMessage", () => {
  it("tells the user to rename one of the two", () => {
    expect(restoreBlockedMessage("status", "Open")).toBe(
      `Can't restore: another status named "Open" already exists. Rename one of them first.`,
    );
  });
});

describe("NAME_RACE_MESSAGE", () => {
  it("asks the user to try again", () => {
    expect(NAME_RACE_MESSAGE).toMatch(/try again/i);
  });
});
