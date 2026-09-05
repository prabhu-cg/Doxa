import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.email("Enter a valid email address"),
  organization: z.string().trim().max(120).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (at least 10 characters)")
    .max(4000),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
