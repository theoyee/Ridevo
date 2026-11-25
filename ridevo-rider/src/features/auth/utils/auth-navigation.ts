import type { Href } from "expo-router";

import type { AuthSession } from "../types/auth.types";

export function getAuthenticatedRoute(session: AuthSession): Href {
  if (!session.user.profileCompleted) {
    return "/(auth)/profile-setup";
  }

  switch (session.onboardingStage) {
    case "profile":
    case "location":
      return "/(auth)/location-permission";

    case "notifications":
      return "/(auth)/notification-permission";

    case "completed":
      return "/(tabs)";

    default:
      return "/(auth)/profile-setup";
  }
}
