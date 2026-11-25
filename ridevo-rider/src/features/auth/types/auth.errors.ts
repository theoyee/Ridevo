export class SessionExpiredError extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");

    this.name = "SessionExpiredError";
  }
}

export class InvalidOnboardingTransitionError extends Error {
  constructor() {
    super("Invalid onboarding transition.");

    this.name = "InvalidOnboardingTransitionError";
  }
}
