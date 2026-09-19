import { describe, expect, it } from "vitest";
import { notificationMessage } from "./notification-message";

const base = { actorName: "Ana", itemTitle: "Dark mode", data: {} };

describe("notificationMessage", () => {
  it("says what was decided, by its label", () => {
    expect(
      notificationMessage({
        ...base,
        type: "ITEM_DECISION",
        data: { decisionType: "PLANNED", roadmapStage: "NEXT" },
      }),
    ).toBe('Decision on "Dark mode": Planned');
  });

  it("labels multi-word decisions properly", () => {
    expect(
      notificationMessage({
        ...base,
        type: "ITEM_DECISION",
        data: { decisionType: "IN_PROGRESS" },
      }),
    ).toBe('Decision on "Dark mode": In Progress');
  });

  it("does not depend on knowing who decided", () => {
    expect(
      notificationMessage({
        ...base,
        actorName: null,
        type: "ITEM_DECISION",
        data: { decisionType: "DECLINED" },
      }),
    ).toBe('Decision on "Dark mode": Declined');
  });

  it("falls back gracefully for an unknown decision type", () => {
    expect(
      notificationMessage({
        ...base,
        type: "ITEM_DECISION",
        data: { decisionType: "SOMETHING_NEW" },
      }),
    ).toBe('Decision on "Dark mode": recorded');
  });

  it("still words the other notifications as before", () => {
    expect(notificationMessage({ ...base, type: "ITEM_COMMENT" })).toBe(
      'Ana commented on "Dark mode"',
    );
    expect(
      notificationMessage({
        ...base,
        type: "ITEM_STATUS_CHANGED",
        data: { fromStatus: "Open", toStatus: "Planned" },
      }),
    ).toBe('"Dark mode" changed from Open to Planned');
  });
});
