import { useMutation } from "@tanstack/react-query";

import { authService } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";

import type { CompleteProfileInput } from "../types/auth.types";

export function useCompleteProfile() {
  return useMutation({
    mutationKey: ["auth", "complete-profile"],

    mutationFn: async (profile: CompleteProfileInput) => {
      const session = useAuthStore.getState().session;

      if (!session) {
        throw new Error("Please sign in to continue.");
      }

      return authService.completeProfile({
        accessToken: session.accessToken,
        profile,
      });
    },

    retry: false,
  });
}
