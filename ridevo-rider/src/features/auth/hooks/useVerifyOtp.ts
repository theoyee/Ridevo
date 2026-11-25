import { useMutation } from "@tanstack/react-query";

import { authService } from "../services/auth.service";

export function useVerifyOtp() {
  return useMutation({
    mutationKey: ["auth", "verify-otp"],
    mutationFn: authService.verifyOtp,
    retry: false,
  });
}
