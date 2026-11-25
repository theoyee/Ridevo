import { normalizePhoneNumber } from "@/utils/phone";

import {
  InvalidOnboardingTransitionError,
  SessionExpiredError,
} from "../types/auth.errors";

import type {
  AuthService,
  AuthSession,
  AuthUser,
  OnboardingStage,
  SendOtpResponse,
} from "../types/auth.types";

import { profileSchema } from "../schemas/profile.schema";

import {
  mockDatabase,
  type MockChallenge,
  type MockDatabase,
} from "./mock-database";

// Development configuration
const MOCK_OTP = "123456";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const SESSION_EXPIRY_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function requireSession(
  database: MockDatabase,
  accessToken: string,
): AuthSession {
  const session = database.sessions[accessToken];

  if (!session || Date.parse(session.expiresAt) <= Date.now()) {
    throw new SessionExpiredError();
  }

  return session;
}

function createChallenge(
  database: MockDatabase,
  phone: string,
): SendOtpResponse {
  const now = Date.now();

  const previousId = database.activeChallenges[phone];

  if (previousId) {
    delete database.challenges[previousId];
  }

  const challenge: MockChallenge = {
    challengeId: createId("challenge"),

    phone,

    expiresAt: new Date(now + OTP_EXPIRY_MS).toISOString(),

    resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS).toISOString(),

    attempts: 0,

    consumed: false,
  };

  database.challenges[challenge.challengeId] = challenge;

  database.activeChallenges[phone] = challenge.challengeId;

  return {
    challengeId: challenge.challengeId,
    phone: challenge.phone,
    expiresAt: challenge.expiresAt,
    resendAvailableAt: challenge.resendAvailableAt,
  };
}

const stageTransitions: Record<OnboardingStage, OnboardingStage[]> = {
  profile: ["profile"],
  location: ["location", "notifications"],
  notifications: ["notifications", "completed"],
  completed: ["completed"],
};

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

    return mockDatabase.transaction((database) => {
      const existingId = database.activeChallenges[normalizedPhone];

      const existingChallenge = existingId
        ? database.challenges[existingId]
        : undefined;

      if (
        existingChallenge &&
        !existingChallenge.consumed &&
        Date.parse(existingChallenge.resendAvailableAt) > Date.now()
      ) {
        throw new Error("Please wait before requesting another code.");
      }

      return createChallenge(database, normalizedPhone);
    });
  },

  // ==========================================
  // VERIFY OTP
  // ==========================================

  async verifyOtp({ challengeId, code }) {
    await delay(900);

    const result = await mockDatabase.transaction((database) => {
      const challenge = database.challenges[challengeId];

      if (!challenge || challenge.consumed) {
        throw new Error("This verification request is no longer valid.");
      }

      if (Date.parse(challenge.expiresAt) <= Date.now()) {
        throw new Error("Your verification code has expired.");
      }

      if (challenge.attempts >= MAX_ATTEMPTS) {
        throw new Error("Too many incorrect attempts. Request a new code.");
      }

      if (code !== MOCK_OTP) {
        challenge.attempts += 1;

        const remaining = MAX_ATTEMPTS - challenge.attempts;

        return {
          success: false as const,

          message:
            remaining > 0
              ? `Incorrect code. ${remaining} ${
                  remaining === 1 ? "attempt" : "attempts"
                } remaining.`
              : "Too many incorrect attempts. Request a new code.",
        };
      }

      challenge.consumed = true;

      delete database.activeChallenges[challenge.phone];

      const existingUser = database.users[challenge.phone];

      const user: AuthUser = existingUser ?? {
        id: createId("mock-user"),

        phone: challenge.phone,

        firstName: null,
        lastName: null,
        email: null,

        profileCompleted: false,
      };

      database.users[user.phone] = user;

      const session: AuthSession = {
        accessToken: createId("mock-access"),

        refreshToken: createId("mock-refresh"),

        expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS).toISOString(),

        user,

        onboardingStage: user.profileCompleted ? "location" : "profile",
      };

      database.sessions[session.accessToken] = session;

      return {
        success: true as const,
        session,
      };
    });

    // Throw after the transaction commits so that
    // incorrect OTP attempts are persisted.
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.session;
  },

  // ==========================================
  // RESEND OTP
  // ==========================================

  async resendOtp({ challengeId }) {
    await delay(800);

    return mockDatabase.transaction((database) => {
      const challenge = database.challenges[challengeId];

      if (!challenge || challenge.consumed) {
        throw new Error(
          "Verification request not found. Enter your phone number again.",
        );
      }

      if (Date.parse(challenge.resendAvailableAt) > Date.now()) {
        throw new Error("Please wait before requesting another code.");
      }

      return createChallenge(database, challenge.phone);
    });
  },

  // ==========================================
  // COMPLETE PROFILE
  // ==========================================

  async completeProfile({ accessToken, profile }) {
    await delay(900);

    const validation = profileSchema.safeParse({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email ?? "",
    });

    if (!validation.success) {
      throw new Error(
        validation.error.issues[0]?.message ?? "Invalid profile information.",
      );
    }

    return mockDatabase.transaction((database) => {
      const session = requireSession(database, accessToken);

      const updatedUser: AuthUser = {
        ...session.user,

        firstName: validation.data.firstName,

        lastName: validation.data.lastName,

        email: validation.data.email || null,

        profileCompleted: true,
      };

      database.users[updatedUser.phone] = updatedUser;

      // Synchronize the user across active sessions.
      for (const token of Object.keys(database.sessions)) {
        const current = database.sessions[token];

        if (current && current.user.id === updatedUser.id) {
          database.sessions[token] = {
            ...current,

            user: updatedUser,

            onboardingStage:
              current.onboardingStage === "profile"
                ? "location"
                : current.onboardingStage,
          };
        }
      }

      return updatedUser;
    });
  },

  // ==========================================
  // VALIDATE SESSION
  // ==========================================

  async validateSession(accessToken) {
    await delay(200);

    return mockDatabase.read((database) => {
      return requireSession(database, accessToken);
    });
  },

  // ==========================================
  // UPDATE ONBOARDING STAGE
  // ==========================================

  async updateOnboardingStage(accessToken, stage) {
    return mockDatabase.transaction((database) => {
      const session = requireSession(database, accessToken);

      if (!session.user.profileCompleted) {
        throw new InvalidOnboardingTransitionError();
      }

      const allowedStages = stageTransitions[session.onboardingStage];

      if (!allowedStages.includes(stage)) {
        throw new InvalidOnboardingTransitionError();
      }

      const updatedSession: AuthSession = {
        ...session,
        onboardingStage: stage,
      };

      database.sessions[accessToken] = updatedSession;

      return updatedSession;
    });
  },

  // ==========================================
  // SIGN OUT
  // ==========================================

  async signOut(accessToken) {
    return mockDatabase.transaction((database) => {
      delete database.sessions[accessToken];
    });
  },
};
