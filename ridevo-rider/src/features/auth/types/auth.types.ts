export type OnboardingStage =
  "profile" | "location" | "notifications" | "completed";

export interface SendOtpInput {
  phone: string;
}

export interface SendOtpResponse {
  challengeId: string;
  phone: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface VerifyOtpInput {
  challengeId: string;
  code: string;
}

export interface ResendOtpInput {
  challengeId: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileCompleted: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
  onboardingStage: OnboardingStage;
}

export interface CompleteProfileInput {
  firstName: string;
  lastName: string;
  email?: string;
}

export interface CompleteProfileRequest {
  accessToken: string;
  profile: CompleteProfileInput;
}

export interface AuthService {
  sendOtp(input: SendOtpInput): Promise<SendOtpResponse>;

  verifyOtp(input: VerifyOtpInput): Promise<AuthSession>;

  resendOtp(input: ResendOtpInput): Promise<SendOtpResponse>;

  completeProfile(input: CompleteProfileRequest): Promise<AuthUser>;

  validateSession(accessToken: string): Promise<AuthSession>;

  updateOnboardingStage(
    accessToken: string,
    stage: OnboardingStage,
  ): Promise<AuthSession>;

  signOut(accessToken: string): Promise<void>;
}
