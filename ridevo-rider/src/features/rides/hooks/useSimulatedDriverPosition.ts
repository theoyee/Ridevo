import { useCallback, useMemo, useState } from "react";

import { AppState } from "react-native";

import { useFocusEffect } from "expo-router";

import type { RideRoute } from "@/features/booking/types/booking.types";

import { RIDE_CONFIG } from "../constants/ride.constants";

import { getRoutePosition, prepareRoute } from "../utils/route-geometry.utils";

import type { Ride } from "../types/ride.types";

const UPDATE_INTERVAL_MS = 500;

export function useSimulatedDriverPosition(
  ride: Ride,
  route: RideRoute | null,
) {
  const [now, setNow] = useState(Date.now);

  const preparedRoute = useMemo(() => {
    if (!route) {
      return null;
    }

    try {
      return prepareRoute(route.coordinates);
    } catch {
      return null;
    }
  }, [route]);

  const isMoving =
    ride.status === "accepted" ||
    ride.status === "arriving" ||
    ride.status === "in_progress";

  useFocusEffect(
    useCallback(() => {
      if (!isMoving || !__DEV__) {
        return;
      }

      setNow(Date.now());

      const interval = setInterval(() => {
        if (AppState.currentState === "active") {
          setNow(Date.now());
        }
      }, UPDATE_INTERVAL_MS);

      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          setNow(Date.now());
        }
      });

      return () => {
        clearInterval(interval);

        subscription.remove();
      };
    }, [isMoving]),
  );

  return useMemo(() => {
    if (!__DEV__ || !preparedRoute) {
      return null;
    }

    let progress = 0;

    if (ride.status === "arrived") {
      progress = 1;
    } else if (ride.status === "in_progress" && ride.startedAt !== null) {
      progress = (now - ride.startedAt) / RIDE_CONFIG.mock.tripDurationMs;
    } else if (
      (ride.status === "accepted" || ride.status === "arriving") &&
      ride.acceptedAt !== null
    ) {
      progress = (now - ride.acceptedAt) / RIDE_CONFIG.mock.arrivalDelayMs;
    } else {
      return null;
    }

    const normalized = Math.max(0, Math.min(1, progress));

    return {
      ...getRoutePosition(preparedRoute, normalized),

      progress: normalized,
    };
  }, [now, preparedRoute, ride.status, ride.acceptedAt, ride.startedAt]);
}
