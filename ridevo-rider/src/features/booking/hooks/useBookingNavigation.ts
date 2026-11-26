import { useCallback, useRef } from "react";

import { useFocusEffect, useRouter } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useLocationStore } from "@/features/location/stores/location.store";

import {
  isLocationFresh,
  isValidCoordinates,
} from "@/features/location/utils/location.utils";

import type {
  Place,
  SavedPlaceType,
} from "@/features/places/types/place.types";

import { BOOKING_CONFIG } from "../constants/booking.constants";

import { useBookingStore } from "../stores/booking.store";

import type { BookingPickup, DestinationSource } from "../types/booking.types";

function requireAuthenticatedUser(): string {
  const state = useAuthStore.getState();

  const userId = state.session?.user.id;

  if (state.status !== "authenticated" || !userId) {
    throw new Error("You must be signed in to continue.");
  }

  return userId;
}

function getSuggestedPickup(): BookingPickup | null {
  const state = useLocationStore.getState();

  const location = state.currentLocation;

  if (
    !state.permission?.granted ||
    !location ||
    !isValidCoordinates(location) ||
    !isLocationFresh(location, BOOKING_CONFIG.pickup.maximumLocationAgeMs)
  ) {
    return null;
  }

  if (
    location.accuracy === null ||
    !Number.isFinite(location.accuracy) ||
    location.accuracy < 0 ||
    location.accuracy > BOOKING_CONFIG.pickup.maximumAccuracyMeters
  ) {
    return null;
  }

  return {
    coordinates: {
      latitude: location.latitude,

      longitude: location.longitude,
    },

    name: null,

    address: null,

    source: "gps",

    accuracy: location.accuracy,

    capturedAt: location.timestamp,
  };
}

export function useBookingNavigation() {
  const router = useRouter();

  const navigationLock = useRef(false);

  useFocusEffect(
    useCallback(() => {
      navigationLock.current = false;
    }, []),
  );

  const openDestinationSearch = useCallback(() => {
    if (navigationLock.current) {
      return;
    }

    const userId = requireAuthenticatedUser();

    navigationLock.current = true;

    try {
      useBookingStore.getState().startBooking({
        userId,

        pickup: getSuggestedPickup(),
      });

      router.push({
        pathname: BOOKING_CONFIG.routes.destinationSearch,

        params: {
          mode: "destination",
        },
      });
    } catch (error) {
      navigationLock.current = false;

      useBookingStore.getState().resetBooking();

      throw error;
    }
  }, [router]);

  const selectDestination = useCallback(
    (place: Place, source: DestinationSource) => {
      if (navigationLock.current) {
        return;
      }

      const userId = requireAuthenticatedUser();

      navigationLock.current = true;

      try {
        useBookingStore.getState().startBooking({
          userId,

          pickup: getSuggestedPickup(),

          destination: {
            ...place,

            source,
          },
        });

        router.push(BOOKING_CONFIG.routes.confirmPickup);
      } catch (error) {
        navigationLock.current = false;

        useBookingStore.getState().resetBooking();

        throw error;
      }
    },
    [router],
  );

  const openSavedPlaceSearch = useCallback(
    (type: SavedPlaceType) => {
      if (navigationLock.current) {
        return;
      }

      requireAuthenticatedUser();

      navigationLock.current = true;

      try {
        router.push({
          pathname: BOOKING_CONFIG.routes.destinationSearch,

          params: {
            mode: type === "home" ? "save-home" : "save-work",
          },
        });
      } catch (error) {
        navigationLock.current = false;

        throw error;
      }
    },
    [router],
  );

  return {
    openDestinationSearch,

    selectDestination,

    openSavedPlaceSearch,
  };
}
