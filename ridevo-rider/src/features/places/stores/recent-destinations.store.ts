import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

import { PLACE_CONFIG } from "../constants/place.constants";

import {
  placeSchema,
  recentDestinationsByUserSchema,
} from "../schemas/place.schema";

import type { Place, RecentDestinationsByUser } from "../types/place.types";

import {
  addRecentDestination,
  areSamePlace,
  sortRecentDestinations,
} from "../utils/place.utils";

interface PersistedRecentDestinations {
  destinationsByUser: RecentDestinationsByUser;
}

interface RecentDestinationsState extends PersistedRecentDestinations {
  hasHydrated: boolean;

  hydrationError: string | null;

  recordDestination: (userId: string, place: Place) => void;

  removeDestination: (userId: string, place: Place) => void;

  clearDestinations: (userId: string) => void;
}

interface HistoryHydrationState {
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

const config = PLACE_CONFIG.recentDestinations;

export const useHistoryHydrationStore = create<HistoryHydrationState>(() => ({
  status: "idle",
  error: null,
}));

export const useRecentDestinationsStore = create<RecentDestinationsState>()(
  persist<RecentDestinationsState, [], [], PersistedRecentDestinations>(
    (set, get) => ({
      destinationsByUser: {},

      hasHydrated: false,

      hydrationError: null,

      recordDestination: (userId, place) => {
        if (!userId.trim() || !get().hasHydrated || get().hydrationError) {
          throw new Error("Destination history is not ready.");
        }

        const validatedPlace = placeSchema.parse(place);

        set((state) => {
          const destinations = state.destinationsByUser[userId] ?? [];

          return {
            destinationsByUser: {
              ...state.destinationsByUser,

              [userId]: addRecentDestination(destinations, validatedPlace),
            },
          };
        });
      },

      removeDestination: (userId, place) => {
        if (!userId.trim() || !get().hasHydrated || get().hydrationError) {
          throw new Error("Destination history is not ready.");
        }

        set((state) => ({
          destinationsByUser: {
            ...state.destinationsByUser,

            [userId]: (state.destinationsByUser[userId] ?? []).filter(
              (destination) => !areSamePlace(destination, place),
            ),
          },
        }));
      },

      clearDestinations: (userId) => {
        if (!userId.trim() || !get().hasHydrated || get().hydrationError) {
          throw new Error("Destination history is not ready.");
        }

        set((state) => {
          const destinationsByUser = {
            ...state.destinationsByUser,
          };

          delete destinationsByUser[userId];

          return {
            destinationsByUser,
          };
        });
      },
    }),

    {
      name: config.storageKey,

      version: config.storageVersion,

      storage: createJSONStorage(() => AsyncStorage),

      skipHydration: true,

      partialize: (state) => ({
        destinationsByUser: state.destinationsByUser,
      }),

      merge: (persistedState, currentState) => {
        if (persistedState == null) {
          return currentState;
        }

        const persisted =
          persistedState as Partial<PersistedRecentDestinations>;

        const result = recentDestinationsByUserSchema.safeParse(
          persisted.destinationsByUser,
        );

        if (!result.success) {
          throw new Error("Invalid destination history.");
        }

        const destinationsByUser = Object.fromEntries(
          Object.entries(result.data).map(([userId, destinations]) => [
            userId,
            sortRecentDestinations(destinations).slice(0, config.maxItems),
          ]),
        );

        return {
          ...currentState,
          destinationsByUser,
        };
      },
    },
  ),
);

// Prevent concurrent hydration requests.
let hydrationPromise: Promise<void> | null = null;

export function hydrateRecentDestinations(): Promise<void> {
  if (useRecentDestinationsStore.persist.hasHydrated()) {
    return Promise.resolve();
  }

  if (hydrationPromise) {
    return hydrationPromise;
  }

  hydrationPromise = (async () => {
    try {
      await useRecentDestinationsStore.persist.rehydrate();

      if (!useRecentDestinationsStore.persist.hasHydrated()) {
        throw new Error("Unable to restore destination history.");
      }

      useRecentDestinationsStore.setState({
        hasHydrated: true,
        hydrationError: null,
      });
    } catch (cause) {
      // Update runtime state without overwriting
      // potentially recoverable persisted history.
      const state = useRecentDestinationsStore.getState();

      state.hasHydrated = false;

      state.hydrationError =
        cause instanceof Error
          ? cause.message
          : "Unable to restore destination history.";

      if (__DEV__) {
        console.warn("[Ridevo] Recent destinations:", state.hydrationError);
      }
    }
  })().finally(() => {
    hydrationPromise = null;
  });

  return hydrationPromise;
}
