import { useCallback } from "react";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useSavedPlacesStore } from "../stores/saved-places.store";

import type {
  SavedPlaces,
  SavedPlaceType,
  SavePlaceInput,
} from "../types/place.types";

const EMPTY_PLACES: SavedPlaces = {
  home: null,
  work: null,
};

export function useSavedPlaces() {
  const userId = useAuthStore((state) => state.session?.user.id);

  const hasHydrated = useSavedPlacesStore((state) => state.hasHydrated);

  const places = useSavedPlacesStore((state) =>
    userId ? (state.placesByUser[userId] ?? EMPTY_PLACES) : EMPTY_PLACES,
  );

  const save = useSavedPlacesStore((state) => state.savePlace);

  const remove = useSavedPlacesStore((state) => state.removePlace);

  const savePlace = useCallback(
    (input: SavePlaceInput) => {
      if (!userId || !hasHydrated) {
        throw new Error("Saved places are not ready.");
      }

      save(userId, input);
    },
    [userId, hasHydrated, save],
  );

  const removePlace = useCallback(
    (type: SavedPlaceType) => {
      if (!userId || !hasHydrated) {
        throw new Error("Saved places are not ready.");
      }

      remove(userId, type);
    },
    [userId, hasHydrated, remove],
  );

  return {
    home: places.home,

    work: places.work,

    places,

    isReady: hasHydrated && Boolean(userId),

    savePlace,

    removePlace,
  };
}
