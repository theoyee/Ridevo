import { useCallback, useEffect, useState } from "react";

import { useFocusEffect } from "expo-router";
import { AppState } from "react-native";

import type { LocationSubscription } from "expo-location";

import { locationService } from "@/features/location/services/location.service";
import { useLocationStore } from "@/features/location/stores/location.store";

export function useMapLocation() {
  const [isForeground, setIsForeground] = useState(
    AppState.currentState === "active",
  );

  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocationStore((state) => state.currentLocation);

  const setPermission = useLocationStore((state) => state.setPermission);

  const setCurrentLocation = useLocationStore(
    (state) => state.setCurrentLocation,
  );

  const setServicesEnabled = useLocationStore(
    (state) => state.setServicesEnabled,
  );

  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      setIsForeground(state === "active");
    });

    return () => listener.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isForeground) {
        setIsTracking(false);
        return;
      }

      let disposed = false;

      let subscription: LocationSubscription | null = null;

      async function startTracking() {
        try {
          setError(null);
          setIsTracking(false);

          const permission = await locationService.getPermission();

          if (disposed) return;

          setPermission(permission);

          if (!permission.granted) {
            setError("Location permission is required.");
            return;
          }

          const enabled = await locationService.isServicesEnabled();

          if (disposed) return;

          setServicesEnabled(enabled);

          if (!enabled) {
            setError("Please enable your device location.");
            return;
          }

          const watcher = await locationService.watchLocation((position) => {
            if (!disposed) {
              setCurrentLocation(position);
            }
          });

          if (disposed) {
            watcher.remove();
            return;
          }

          subscription = watcher;

          setIsTracking(true);
        } catch (cause) {
          if (disposed) return;

          setIsTracking(false);

          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to track your location.",
          );
        }
      }

      void startTracking();

      return () => {
        disposed = true;

        subscription?.remove();
        subscription = null;

        setIsTracking(false);
      };
    }, [isForeground, setPermission, setCurrentLocation, setServicesEnabled]),
  );

  return {
    location,
    isTracking,
    error,
  };
}
