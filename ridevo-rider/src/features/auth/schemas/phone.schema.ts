import { z } from "zod";

import { normalizePhoneNumber } from "@/utils/phone";

export const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number.")
    .refine(
      (value) => normalizePhoneNumber(value) !== null,
      "Enter a valid Nigerian mobile number.",
    ),
});

export type PhoneFormValues = z.infer<typeof phoneSchema>;
