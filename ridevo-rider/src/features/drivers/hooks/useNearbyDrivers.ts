import { useCallback, useEffect, useState } from "react";

import { useFocusEffect } from "expo-router";

import { useQuery } from "@tanstack/react-query";

import { useAppForeground } from "@/hooks/useAppForeground";

import {
  distanceInMeters,
  isValidCoordinates,
} from "@/features/location/utils/location.utils";

import type { UserLocation } from "@/features/location/types/location.types";

import { NEARBY_DRIVER_CONFIG } from "../constants/driver.constants";

import { driverService } from "../services/driver.service";

import type { DriverCoordinates, NearbyDriver } from "../types/driver.types";

const EMPTY_DRIVERS: NearbyDriver[] = [];

interface UseNearbyDriversOptions {
  location: UserLocation | null;
  enabled?: boolean;
}

export function useNearbyDrivers({
  location,
  enabled = true,
}: UseNearbyDriversOptions) {
  const isForeground = useAppForeground();

  const [isFocused, setIsFocused] = useState(false);

  const [now, setNow] = useState(Date.now);

  const [queryCenter, setQueryCenter] = useState<DriverCoordinates | null>(
    null,
  );

  // Track whether the current screen is focused.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);

      return () => {
        setIsFocused(false);
      };
    }, []),
  );

  // Maintain a clock for location and snapshot expiry.
  useEffect(() => {
    if (!isForeground || !isFocused || !enabled) {
      return;
    }

    setNow(Date.now());

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isForeground, isFocused, enabled]);

  const locationAge = location
    ? Math.max(0, now - location.timestamp)
    : Infinity;

  const hasValidLocation =
    location !== null &&
    isValidCoordinates(location) &&
    Number.isFinite(location.timestamp) &&
    locationAge <= NEARBY_DRIVER_CONFIG.maxLocationAgeMs;

  // Keep the query center stable during small GPS changes.
  useEffect(() => {
    if (!location || !hasValidLocation) {
      setQueryCenter(null);

      return;
    }

    const nextCenter: DriverCoordinates = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    setQueryCenter((previous) => {
      if (!previous) {
        return nextCenter;
      }

      const distance = distanceInMeters(previous, nextCenter);

      if (distance >= NEARBY_DRIVER_CONFIG.locationChangeThresholdMeters) {
        return nextCenter;
      }

      return previous;
    });
  }, [location, hasValidLocation]);

  const isActive =
    enabled &&
    isForeground &&
    isFocused &&
    hasValidLocation &&
    queryCenter !== null;

  const query = useQuery({
    queryKey: [
      "drivers",
      "nearby",
      queryCenter?.latitude ?? null,
      queryCenter?.longitude ?? null,
      NEARBY_DRIVER_CONFIG.radiusMeters,
      NEARBY_DRIVER_CONFIG.maxDrivers,
    ],

    queryFn: async ({ signal }) => {
      if (!queryCenter) {
        throw new Error("A valid location is required.");
      }

      const response = await driverService.getNearbyDrivers({
        latitude: queryCenter.latitude,
        longitude: queryCenter.longitude,

        radius: NEARBY_DRIVER_CONFIG.radiusMeters,

        limit: NEARBY_DRIVER_CONFIG.maxDrivers,
      });

      if (signal.aborted) {
        throw new Error("Nearby driver request cancelled.");
      }

      return response;
    },

    enabled: isActive,

    staleTime: NEARBY_DRIVER_CONFIG.staleTimeMs,

    gcTime: NEARBY_DRIVER_CONFIG.garbageCollectionTimeMs,

    refetchInterval: isActive ? NEARBY_DRIVER_CONFIG.pollingIntervalMs : false,

    refetchIntervalInBackground: false,

    refetchOnWindowFocus: false,

    refetchOnReconnect: true,

    retry: 1,
  });

  const snapshotAge = query.dataUpdatedAt
    ? Math.max(0, now - query.dataUpdatedAt)
    : Infinity;

  const hasFreshSnapshot =
    query.data !== undefined &&
    snapshotAge <= NEARBY_DRIVER_CONFIG.maxSnapshotAgeMs;

  const drivers =
    isActive && hasFreshSnapshot
      ? (query.data?.drivers ?? EMPTY_DRIVERS)
      : EMPTY_DRIVERS;

  return {
    drivers,

    isActive,

    isLoading: isActive && query.isPending,

    isFetching: isActive && query.isFetching,

    isStale: query.data !== undefined && !hasFreshSnapshot,

    error: query.error,

    lastUpdatedAt: query.dataUpdatedAt || null,

    refetch: query.refetch,
  };
}
