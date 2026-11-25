import { mockAuthService } from "./auth.mock";

import type { AuthService } from "../types/auth.types";

function createAuthService(): AuthService {
  if (__DEV__) {
    return mockAuthService;
  }

  throw new Error("Production authentication service has not been configured.");
}

export const authService = createAuthService();
