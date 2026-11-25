import { normalizePhoneNumber } from "@/utils/phone";

import type {
  AuthService,
  AuthSession,
  AuthUser,
  SendOtpResponse,
} from "../types/auth.types";

import { SessionExpiredError } from "../types/auth.errors";
// Development configuration
const MOCK_OTP = "123456";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const SESSION_EXPIRY_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// Internal mock challenge
interface MockChallenge extends SendOtpResponse {
  attempts: number;
  consumed: boolean;
}

// In-memory mock database
const challenges = new Map<string, MockChallenge>();
const activeChallenges = new Map<string, string>();
const users = new Map<string, AuthUser>();
const sessions = new Map<string, AuthSession>();

// Simulate network latency
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate mock identifiers
function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Create a new OTP challenge
function createChallenge(phone: string): SendOtpResponse {
  const now = Date.now();

  const previousId = activeChallenges.get(phone);

  // Invalidate any previous challenge
  if (previousId) {
    challenges.delete(previousId);
  }

  const challenge: MockChallenge = {
    challengeId: createId("challenge"),
    phone,

    expiresAt: new Date(now + OTP_EXPIRY_MS).toISOString(),

    resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS).toISOString(),

    attempts: 0,
    consumed: false,
  };

  challenges.set(challenge.challengeId, challenge);

  activeChallenges.set(phone, challenge.challengeId);

  // Do not expose internal challenge properties
  return {
    challengeId: challenge.challengeId,
    phone: challenge.phone,
    expiresAt: challenge.expiresAt,
    resendAvailableAt: challenge.resendAvailableAt,
  };
}

// Mock authentication service
export const mockAuthService: AuthService = {
  // ==========================================
  // SEND OTP
  // ==========================================

  async sendOtp({ phone }) {
    await delay(1000);

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone) {
      throw new Error("Invalid phone number.");
    }

    const existingId = activeChallenges.get(normalizedPhone);

    const existingChallenge = existingId
      ? challenges.get(existingId)
      : undefined;

    if (
      existingChallenge &&
      !existingChallenge.consumed &&
      Date.parse(existingChallenge.resendAvailableAt) > Date.now()
    ) {
      throw new Error("Please wait before requesting another code.");
    }

    return createChallenge(normalizedPhone);
  },

  // ==========================================
  // VERIFY OTP
  // ==========================================

  async verifyOtp({ challengeId, code }) {
    await delay(900);

    const challenge = challenges.get(challengeId);

    if (!challenge || challenge.consumed) {
      throw new Error("This verification request is no longer valid.");
    }

    if (Date.parse(challenge.expiresAt) <= Date.now()) {
      throw new Error(
        "Your verification code has expired. Request a new code.",
      );
    }

    if (challenge.attempts >= MAX_ATTEMPTS) {
      throw new Error("Too many incorrect attempts. Request a new code.");
    }

    if (code !== MOCK_OTP) {
      challenge.attempts += 1;

      const remaining = MAX_ATTEMPTS - challenge.attempts;

      throw new Error(
        remaining > 0
          ? `Incorrect code. ${remaining} ${
              remaining === 1 ? "attempt" : "attempts"
            } remaining.`
          : "Too many incorrect attempts. Request a new code.",
      );
    }

    // Prevent OTP reuse
    challenge.consumed = true;

    // Find an existing rider or create a new one
    const existingUser = users.get(challenge.phone);

    const user: AuthUser = existingUser ?? {
      id: createId("mock-user"),
      phone: challenge.phone,
      firstName: null,
      lastName: null,
      email: null,
      profileCompleted: false,
    };

    users.set(user.phone, user);

    // Create an authenticated session
    const session: AuthSession = {
      accessToken: createId("mock-access"),
      refreshToken: createId("mock-refresh"),

      expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS).toISOString(),

      user,

      onboardingStage: user.profileCompleted ? "location" : "profile",
    };

    sessions.set(session.accessToken, session);

    return session;
  },

  // ==========================================
  // RESEND OTP
  // ==========================================

  async resendOtp({ challengeId }) {
    await delay(800);

    const challenge = challenges.get(challengeId);

    if (!challenge || challenge.consumed) {
      throw new Error(
        "Verification request not found. Enter your phone number again.",
      );
    }

    if (Date.parse(challenge.resendAvailableAt) > Date.now()) {
      throw new Error("Please wait before requesting another code.");
    }

    return createChallenge(challenge.phone);
  },

  // ==========================================
  // COMPLETE PROFILE
  // ==========================================

  async completeProfile({ accessToken, profile }) {
    await delay(900);

    const session = sessions.get(accessToken);

    // Validate the authenticated session
    if (!session || Date.parse(session.expiresAt) <= Date.now()) {
      throw new SessionExpiredError();
    }

    // Normalize profile information
    const firstName = profile.firstName.trim();
    const lastName = profile.lastName.trim();
    const email = profile.email?.trim() || null;

    // Validate names
    if (!firstName || !lastName) {
      throw new Error("First name and last name are required.");
    }

    if (firstName.length > 50 || lastName.length > 50) {
      throw new Error("Names cannot exceed 50 characters.");
    }

    if (
      !/\p{L}/u.test(firstName) ||
      !/\p{L}/u.test(lastName) ||
      /[\p{Cc}\p{Cs}]/u.test(firstName) ||
      /[\p{Cc}\p{Cs}]/u.test(lastName)
    ) {
      throw new Error("Please enter valid names.");
    }

    // Validate optional email
    if (
      email &&
      (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      throw new Error("Please enter a valid email address.");
    }

    // Update rider information
    const updatedUser: AuthUser = {
      ...session.user,
      firstName,
      lastName,
      email,
      profileCompleted: true,
    };

    // Persist user in mock database
    users.set(updatedUser.phone, updatedUser);

    // Update the mock authenticated session
    const updatedSession: AuthSession = {
      ...session,
      user: updatedUser,
      onboardingStage: "location",
    };

    sessions.set(accessToken, updatedSession);

    return updatedUser;
  },
};
