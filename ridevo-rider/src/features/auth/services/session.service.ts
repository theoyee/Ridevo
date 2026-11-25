import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { z } from "zod";

import type { AuthSession } from "../types/auth.types";

const SESSION_KEY = "ridevo.auth.session.v1";

const sessionSchema = z
  .object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    expiresAt: z.string().datetime(),

    user: z.object({
      id: z.string().min(1),
      phone: z.string().min(1),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      email: z.string().nullable().default(null),
      profileCompleted: z.boolean(),
    }),

    onboardingStage: z
      .enum(["profile", "location", "notifications", "completed"])
      .optional(),
  })
  .transform((session) => ({
    ...session,
    onboardingStage:
      session.onboardingStage ??
      (session.user.profileCompleted ? "location" : "profile"),
  }));

// Temporary memory-only storage for web development.
let webSession: AuthSession | null = null;

export const sessionService = {
  async save(session: AuthSession): Promise<void> {
    if (Platform.OS === "web") {
      webSession = session;
      return;
    }

    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },

  async get(): Promise<AuthSession | null> {
    if (Platform.OS === "web") {
      return webSession;
    }

    const stored = await SecureStore.getItemAsync(SESSION_KEY);

    if (!stored) return null;

    try {
      const result = sessionSchema.safeParse(JSON.parse(stored));

      if (result.success) {
        return result.data;
      }
    } catch {
      // Invalid persisted session.
    }

    await SecureStore.deleteItemAsync(SESSION_KEY);

    return null;
  },

  async clear(): Promise<void> {
    if (Platform.OS === "web") {
      webSession = null;
      return;
    }

    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
