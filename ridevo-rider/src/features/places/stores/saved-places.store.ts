import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

import { z } from "zod";

import {
  savedPlacesSchema,
  savePlaceInputSchema,
} from "../schemas/place.schema";

import type {
  SavedPlace,
  SavedPlaces,
  SavedPlaceType,
  SavePlaceInput,
} from "../types/place.types";

interface PersistedSavedPlaces {
  placesByUser: Record<string, SavedPlaces>;
}

interface SavedPlacesState extends PersistedSavedPlaces {
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;

  savePlace: (userId: string, input: SavePlaceInput) => void;

  removePlace: (userId: string, type: SavedPlaceType) => void;

  clearUserPlaces: (userId: string) => void;
}

const EMPTY_PLACES: SavedPlaces = {
  home: null,
  work: null,
};

const persistedStateSchema = z.object({
  placesByUser: z.record(z.string(), savedPlacesSchema),
});

export const useSavedPlacesStore = create<SavedPlacesState>()(
  persist<SavedPlacesState, [], [], PersistedSavedPlaces>(
    (set) => ({
      placesByUser: {},

      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      savePlace: (userId, input) => {
        if (!userId.trim()) {
          throw new Error("A valid user ID is required.");
        }

        const validated = savePlaceInputSchema.parse(input);

        set((state) => {
          const currentPlaces = state.placesByUser[userId] ?? EMPTY_PLACES;

          const existing = currentPlaces[validated.type];

          const now = Date.now();

          const savedPlace: SavedPlace = {
            ...validated.place,

            type: validated.type,

            createdAt: existing?.createdAt ?? now,

            updatedAt: now,
          };

          return {
            placesByUser: {
              ...state.placesByUser,

              [userId]: {
                ...currentPlaces,

                [validated.type]: savedPlace,
              },
            },
          };
        });
      },

      removePlace: (userId, type) => {
        set((state) => {
          const currentPlaces = state.placesByUser[userId];

          if (!currentPlaces) {
            return state;
          }

          return {
            placesByUser: {
              ...state.placesByUser,

              [userId]: {
                ...currentPlaces,

                [type]: null,
              },
            },
          };
        });
      },

      clearUserPlaces: (userId) => {
        set((state) => {
          const next = {
            ...state.placesByUser,
          };

          delete next[userId];

          return {
            placesByUser: next,
          };
        });
      },
    }),

    {
      name: "ridevo.saved-places.v1",

      version: 1,

      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        placesByUser: state.placesByUser,
      }),

      merge: (persistedState, currentState) => {
        const result = persistedStateSchema.safeParse(persistedState);

        if (!result.success) {
          return currentState;
        }

        return {
          ...currentState,

          placesByUser: result.data.placesByUser,
        };
      },

      onRehydrateStorage: (state) => {
        return (_restoredState, error) => {
          if (error && __DEV__) {
            console.warn("[Ridevo] Saved places hydration failed:", error);
          }

          state.setHasHydrated(true);
        };
      },
    },
  ),
);
