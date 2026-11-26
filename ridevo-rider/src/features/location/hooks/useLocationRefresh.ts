import { useCallback } from "react";

import { useFocusEffect } from "expo-router";

import { AppState } from "react-native";

import { locationService } from "../services/location.service";

import { useLocationStore } from "../stores/location.store";

import { isLocationFresh, isValidCoordinates } from "../utils/location.utils";

const REFRESH_INTERVAL_MS = 15_000;

const MAX_LOCATION_AGE_MS = 25_000;

export function useLocationRefresh(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }

      let disposed = false;

      let inFlight = false;

      const refresh = async () => {
        if (disposed || inFlight || AppState.currentState !== "active") {
          return;
        }

        const state = useLocationStore.getState();

        if (!state.permission?.granted) {
          return;
        }

        if (
          state.currentLocation &&
          isLocationFresh(state.currentLocation, MAX_LOCATION_AGE_MS)
        ) {
          return;
        }

        inFlight = true;

        try {
          const location = await locationService.getCurrentLocation();

          if (
            disposed ||
            AppState.currentState !== "active" ||
            !isValidCoordinates(location)
          ) {
            return;
          }

          const permission = await locationService.getPermission();

          if (
            disposed ||
            AppState.currentState !== "active" ||
            !permission.granted
          ) {
            return;
          }

          const current = useLocationStore.getState();

          if (
            current.currentLocation &&
            current.currentLocation.timestamp > location.timestamp
          ) {
            return;
          }

          current.setCurrentLocation(location);
        } catch (cause) {
          if (__DEV__ && !disposed) {
            console.warn("[Ridevo] Location refresh failed:", cause);
          }
        } finally {
          inFlight = false;
        }
      };

      void refresh();

      const interval = setInterval(() => {
        void refresh();
      }, REFRESH_INTERVAL_MS);

      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          void refresh();
        }
      });

      return () => {
        disposed = true;

        clearInterval(interval);

        subscription.remove();
      };
    }, [enabled]),
  );
}
