export interface SendOtpInput {
  phone: string;
}

export interface SendOtpResponse {
  challengeId: string;
  phone: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface AuthService {
  sendOtp(input: SendOtpInput): Promise<SendOtpResponse>;
}
