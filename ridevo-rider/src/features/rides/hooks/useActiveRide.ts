import { useCallback, useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useFocusEffect } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useActiveRideStore } from "../stores/active-ride.store";

import { rideService } from "../services/ride.service";

import { RIDE_CONFIG } from "../constants/ride.constants";

import { isTerminalRideStatus } from "../utils/ride-status.utils";

export function useActiveRide() {
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);

      return () => {
        setIsFocused(false);
      };
    }, []),
  );

  const userId = useAuthStore((state) => state.session?.user.id);

  const ride = useActiveRideStore((state) =>
    userId && state.ride?.userId === userId ? state.ride : null,
  );

  const setRide = useActiveRideStore((state) => state.setRide);

  const rideId = ride?.id;

  const isTerminal = ride ? isTerminalRideStatus(ride.status) : false;

  const query = useQuery({
    queryKey: ["rides", "active", userId, rideId],

    queryFn: async () => {
      if (!rideId) {
        throw new Error("No active ride.");
      }

      return rideService.getRide(rideId);
    },

    enabled: Boolean(userId && rideId && isFocused && !isTerminal),

    refetchInterval: RIDE_CONFIG.matching.pollingIntervalMs,

    refetchIntervalInBackground: false,

    refetchOnWindowFocus: true,

    staleTime: 0,

    gcTime: 0,

    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      setRide(query.data);
    }
  }, [query.data, setRide]);

  return {
    ride,

    isRefreshing: query.isFetching,

    error: query.error,

    refresh: query.refetch,
  };
}
