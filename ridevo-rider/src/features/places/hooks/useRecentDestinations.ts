import { useCallback, useEffect, useMemo } from "react";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { PLACE_CONFIG } from "../constants/place.constants";

import {
  hydrateRecentDestinations,
  useHistoryHydrationStore,
  useRecentDestinationsStore,
} from "../stores/recent-destinations.store";

import type { Place, RecentDestination } from "../types/place.types";

const EMPTY_DESTINATIONS: RecentDestination[] = [];

export function useRecentDestinations() {
  const userId = useAuthStore((state) => state.session?.user.id);

  const status = useHistoryHydrationStore((state) => state.status);

  const error = useHistoryHydrationStore((state) => state.error);

  const destinations = useRecentDestinationsStore((state) =>
    userId && status === "ready"
      ? (state.destinationsByUser[userId] ?? EMPTY_DESTINATIONS)
      : EMPTY_DESTINATIONS,
  );

  const record = useRecentDestinationsStore((state) => state.recordDestination);

  const remove = useRecentDestinationsStore((state) => state.removeDestination);

  const clear = useRecentDestinationsStore((state) => state.clearDestinations);

  useEffect(() => {
    if (userId && status === "idle") {
      void hydrateRecentDestinations();
    }
  }, [userId, status]);

  const previewDestinations = useMemo(
    () =>
      destinations.slice(0, PLACE_CONFIG.recentDestinations.homePreviewLimit),
    [destinations],
  );

  const requireUser = useCallback(() => {
    const activeUserId = useAuthStore.getState().session?.user.id;

    if (
      !userId ||
      activeUserId !== userId ||
      useHistoryHydrationStore.getState().status !== "ready"
    ) {
      throw new Error("Destination history is not ready.");
    }

    return userId;
  }, [userId]);

  const recordDestination = useCallback(
    (place: Place) => {
      record(requireUser(), place);
    },
    [requireUser, record],
  );

  const removeDestination = useCallback(
    (place: Place) => {
      remove(requireUser(), place);
    },
    [requireUser, remove],
  );

  const clearDestinations = useCallback(() => {
    clear(requireUser());
  }, [requireUser, clear]);

  return {
    destinations,

    previewDestinations,

    isReady: status === "ready" && Boolean(userId),

    isLoading: status === "idle" || status === "loading",

    error,

    retry: hydrateRecentDestinations,

    recordDestination,

    removeDestination,

    clearDestinations,
  };
}
