import { useMutation } from "@tanstack/react-query";

import { authService } from "../services/auth.service";

import type { SendOtpInput, SendOtpResponse } from "../types/auth.types";

export function useSendOtp() {
  return useMutation<SendOtpResponse, Error, SendOtpInput>({
    mutationKey: ["auth", "send-otp"],

    mutationFn: (input) => authService.sendOtp(input),

    retry: false,
  });
}
