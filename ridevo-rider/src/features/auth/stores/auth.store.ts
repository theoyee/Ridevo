// import { create } from "zustand";

// import { sessionService } from "../services/session.service";

// import type { AuthSession, SendOtpResponse } from "../types/auth.types";

// type AuthStatus = "initializing" | "unauthenticated" | "authenticated";

// interface AuthState {
//   status: AuthStatus;
//   session: AuthSession | null;
//   challenge: SendOtpResponse | null;

//   setChallenge: (challenge: SendOtpResponse) => void;
//   clearChallenge: () => void;

//   setSession: (session: AuthSession) => Promise<void>;

//   hydrate: () => Promise<void>;

//   signOut: () => Promise<void>;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   status: "initializing",

//   session: null,

//   challenge: null,

//   setChallenge: (challenge) => {
//     set({ challenge });
//   },

//   clearChallenge: () => {
//     set({ challenge: null });
//   },

//   setSession: async (session) => {
//     await sessionService.save(session);

//     set({
//       session,
//       challenge: null,
//       status: "authenticated",
//     });
//   },

//   hydrate: async () => {
//     try {
//       const session = await sessionService.get();

//       if (!session || Date.parse(session.expiresAt) <= Date.now()) {
//         await sessionService.clear();

//         set({
//           session: null,
//           status: "unauthenticated",
//         });

//         return;
//       }

//       set({
//         session,
//         status: "authenticated",
//       });
//     } catch {
//       set({
//         session: null,
//         status: "unauthenticated",
//       });
//     }
//   },

//   signOut: async () => {
//     await sessionService.clear();

//     set({
//       session: null,
//       challenge: null,
//       status: "unauthenticated",
//     });
//   },
// }));

import { create } from "zustand";

import { sessionService } from "../services/session.service";

import type {
  AuthSession,
  AuthUser,
  OnboardingStage,
  SendOtpResponse,
} from "../types/auth.types";

type AuthStatus = "initializing" | "unauthenticated" | "authenticated";

interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  challenge: SendOtpResponse | null;

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

  setChallenge: (challenge) => {
    set({ challenge });
  },

  clearChallenge: () => {
    set({ challenge: null });
  },

  setSession: async (session) => {
    await sessionService.save(session);

    set({
      session,
      challenge: null,
      status: "authenticated",
    });
  },

  completeProfile: async (user) => {
    const currentSession = get().session;

    if (!currentSession) {
      throw new Error("No authenticated session.");
    }

    const updatedSession: AuthSession = {
      ...currentSession,
      user,
      onboardingStage: "location",
    };

    await sessionService.save(updatedSession);

    set({ session: updatedSession });
  },

  setOnboardingStage: async (stage) => {
    const currentSession = get().session;

    if (!currentSession) {
      throw new Error("No authenticated session.");
    }

    const updatedSession: AuthSession = {
      ...currentSession,
      onboardingStage: stage,
    };

    await sessionService.save(updatedSession);

    set({ session: updatedSession });
  },

  hydrate: async () => {
    try {
      const session = await sessionService.get();

      if (!session || Date.parse(session.expiresAt) <= Date.now()) {
        await sessionService.clear();

        set({
          session: null,
          status: "unauthenticated",
        });

        return;
      }

      set({
        session,
        status: "authenticated",
      });
    } catch {
      set({
        session: null,
        status: "unauthenticated",
      });
    }
  },

  signOut: async () => {
    await sessionService.clear();

    set({
      session: null,
      challenge: null,
      status: "unauthenticated",
    });
  },
}));
