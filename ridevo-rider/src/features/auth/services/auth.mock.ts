import type {
  AuthService,
  SendOtpInput,
  SendOtpResponse,
} from "../types/auth.types";

import { normalizePhoneNumber } from "@/utils/phone";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

const challenges = new Map<string, SendOtpResponse>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAuthService: AuthService = {
  async sendOtp(input: SendOtpInput): Promise<SendOtpResponse> {
    await delay(1200);

    const phone = normalizePhoneNumber(input.phone);

    if (!phone) {
      throw new Error("Invalid phone number.");
    }

    const now = Date.now();
    const existing = challenges.get(phone);

    if (existing && Date.parse(existing.resendAvailableAt) > now) {
      throw new Error("Please wait before requesting another code.");
    }

    const challenge: SendOtpResponse = {
      challengeId: `mock-${now}-${Math.random().toString(36).slice(2)}`,
      phone,
      expiresAt: new Date(now + OTP_EXPIRY_MS).toISOString(),
      resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS).toISOString(),
    };

    challenges.set(phone, challenge);

    return challenge;
  },
};
