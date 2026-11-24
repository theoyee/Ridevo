import { create } from "zustand";

import type { SendOtpResponse } from "../types/auth.types";

interface AuthState {
  challenge: SendOtpResponse | null;

  setChallenge: (challenge: SendOtpResponse) => void;

  clearChallenge: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  challenge: null,

  setChallenge: (challenge) => {
    set({ challenge });
  },

  clearChallenge: () => {
    set({ challenge: null });
  },
}));
