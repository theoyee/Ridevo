import { create } from "zustand";

import { authService } from "../services/auth.service";
import { sessionService } from "../services/session.service";

import { SessionExpiredError } from "../types/auth.errors";

import type {
  AuthSession,
  AuthUser,
  OnboardingStage,
  SendOtpResponse,
} from "../types/auth.types";

type AuthStatus =
  "initializing" | "unauthenticated" | "authenticated" | "error";

interface AuthState {
  status: AuthStatus;

  session: AuthSession | null;

  challenge: SendOtpResponse | null;

  initializationError: string | null;

  setChallenge: (challenge: SendOtpResponse) => void;

  clearChallenge: () => void;

  setSession: (session: AuthSession) => Promise<void>;

  completeProfile: (user: AuthUser) => Promise<void>;

  setOnboardingStage: (stage: OnboardingStage) => Promise<void>;

  hydrate: () => Promise<void>;

  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "initializing",

  session: null,

  challenge: null,

  initializationError: null,

  setChallenge: (challenge) => {
    set({ challenge });
  },

  clearChallenge: () => {
    set({ challenge: null });
  },

  // ==========================================
  // SET SESSION
  // ==========================================

  setSession: async (session) => {
    await sessionService.save(session);

    set({
      session,
      challenge: null,
      status: "authenticated",
      initializationError: null,
    });
  },

  // ==========================================
  // COMPLETE PROFILE
  // ==========================================

  completeProfile: async (user) => {
    const currentSession = get().session;

    if (!currentSession) {
      throw new SessionExpiredError();
    }

    const updatedSession: AuthSession = {
      ...currentSession,

      user,

      onboardingStage:
        currentSession.onboardingStage === "profile"
          ? "location"
          : currentSession.onboardingStage,
    };

    await sessionService.save(updatedSession);

    set({ session: updatedSession });
  },

  // ==========================================
  // UPDATE ONBOARDING
  // ==========================================

  setOnboardingStage: async (stage) => {
    const currentSession = get().session;

    if (!currentSession) {
      throw new SessionExpiredError();
    }

    const updatedSession = await authService.updateOnboardingStage(
      currentSession.accessToken,
      stage,
    );

    await sessionService.save(updatedSession);

    set({ session: updatedSession });
  },

  // ==========================================
  // RESTORE AND VALIDATE SESSION
  // ==========================================

  hydrate: async () => {
    set({
      status: "initializing",
      initializationError: null,
    });

    try {
      const storedSession = await sessionService.get();

      if (!storedSession || Date.parse(storedSession.expiresAt) <= Date.now()) {
        await sessionService.clear();

        set({
          session: null,
          status: "unauthenticated",
        });

        return;
      }

      // Verify that the server recognizes
      // the locally persisted access token.
      const validatedSession = await authService.validateSession(
        storedSession.accessToken,
      );

      // Synchronize local state with the server.
      await sessionService.save(validatedSession);

      set({
        session: validatedSession,
        status: "authenticated",
      });
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        try {
          await sessionService.clear();

          set({
            session: null,
            challenge: null,
            status: "unauthenticated",
          });
        } catch {
          set({
            session: null,
            status: "error",
            initializationError: "Unable to clear your expired session.",
          });
        }

        return;
      }

      set({
        session: null,

        status: "error",

        initializationError:
          error instanceof Error
            ? error.message
            : "Unable to restore your session.",
      });
    }
  },

  // ==========================================
  // SIGN OUT
  // ==========================================

  signOut: async () => {
    const session = get().session;

    if (session) {
      await authService.signOut(session.accessToken);
    }

    await sessionService.clear();

    set({
      session: null,
      challenge: null,
      status: "unauthenticated",
      initializationError: null,
    });
  },
}));
