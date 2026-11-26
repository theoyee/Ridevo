import { useCallback, useState } from "react";

import { useFocusEffect } from "expo-router";

import { RIDE_CONFIG } from "../constants/ride.constants";

import type { Ride } from "../types/ride.types";

export function useTripProgress(ride: Ride) {
  const [now, setNow] = useState(Date.now);

  const isInProgress = ride.status === "in_progress";

  useFocusEffect(
    useCallback(() => {
      if (!isInProgress) {
        return;
      }

      setNow(Date.now());

      const interval = setInterval(() => {
        setNow(Date.now());
      }, RIDE_CONFIG.mock.tripProgressIntervalMs);

      return () => {
        clearInterval(interval);
      };
    }, [isInProgress]),
  );

  const duration = RIDE_CONFIG.mock.tripDurationMs;

  const elapsedMs =
    ride.startedAt === null
      ? 0
      : Math.min(duration, Math.max(0, now - ride.startedAt));

  const progress = ride.status === "completed" ? 1 : elapsedMs / duration;

  return {
    progress,

    percentage: Math.round(progress * 100),

    remainingSeconds: Math.ceil(Math.max(0, duration - elapsedMs) / 1000),
  };
}
