"use server";

import { Resend } from "resend";
import { serverEnv } from "@/lib/env/server";
import { contactFormSchema } from "./schema";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Sends the notification via Resend when it's actually configured;
 * otherwise logs server-side. This is the seam a later phase connects
 * real delivery through — nothing else about the form needs to change.
 */
async function notifyContactSubmission(values: {
  name: string;
  email: string;
  organization?: string;
  message: string;
}): Promise<void> {
  const { RESEND_API_KEY, RESEND_FROM_EMAIL, CONTACT_NOTIFICATION_EMAIL } =
    serverEnv;

  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !CONTACT_NOTIFICATION_EMAIL) {
    console.log(
      "[contact] submission received (email delivery not configured):",
      {
        name: values.name,
        email: values.email,
        organization: values.organization,
      },
    );
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: CONTACT_NOTIFICATION_EMAIL,
    replyTo: values.email,
    subject: `New contact form submission from ${values.name}`,
    text: [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      values.organization ? `Organisation: ${values.organization}` : null,
      "",
      values.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function submitContactForm(input: {
  name: string;
  email: string;
  organization?: string;
  message: string;
}): Promise<ActionResult> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await notifyContactSubmission(parsed.data);
  } catch (error) {
    console.error("[contact] failed to send notification:", error);
    return {
      success: false,
      error: "Something went wrong sending your message. Please try again.",
    };
  }

  return { success: true };
}
