import { describe, expect, it } from "vitest";
import { contactFormSchema } from "./schema";

describe("contactFormSchema", () => {
  it("accepts valid input", () => {
    const result = contactFormSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      organization: "Acme Inc.",
      message: "This is a long enough message.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts input with no organisation", () => {
    const result = contactFormSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "This is a long enough message.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = contactFormSchema.safeParse({
      name: "",
      email: "jane@example.com",
      message: "This is a long enough message.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({
      name: "Jane Doe",
      email: "not-an-email",
      message: "This is a long enough message.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message that's too short", () => {
    const result = contactFormSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "short",
    });
    expect(result.success).toBe(false);
  });
});
