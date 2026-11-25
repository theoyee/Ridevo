import { z } from "zod";

export const OTP_LENGTH = 6;

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit verification code."),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
