import { useMutation } from "@tanstack/react-query";

import { authService } from "../services/auth.service";

export function useResendOtp() {
  return useMutation({
    mutationKey: ["auth", "resend-otp"],
    mutationFn: authService.resendOtp,
    retry: false,
  });
}
