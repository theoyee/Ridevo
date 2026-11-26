import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { useLocationStore } from "@/features/location/stores/location.store";

import {
  isLocationFresh,
  isValidCoordinates,
} from "@/features/location/utils/location.utils";

import { SEARCH_CONFIG } from "../constants/search.constants";

import {
  geocodingService,
  PlaceSearchError,
} from "../services/geocoding.service";

interface UsePlaceSearchOptions {
  enabled?: boolean;
  permanent?: boolean;
}

export function usePlaceSearch(
  query: string,
  { enabled = true, permanent = false }: UsePlaceSearchOptions = {},
) {
  const normalizedQuery = query.trim();

  const debouncedQuery = useDebouncedValue(
    normalizedQuery,
    SEARCH_CONFIG.debounceMs,
  );

  const location = useLocationStore((state) => state.currentLocation);

  const proximity =
    location && isValidCoordinates(location) && isLocationFresh(location)
      ? {
          latitude: Number(location.latitude.toFixed(3)),

          longitude: Number(location.longitude.toFixed(3)),
        }
      : undefined;

  const isDebouncing = normalizedQuery !== debouncedQuery;

  const hasMinimumLength =
    normalizedQuery.length >= SEARCH_CONFIG.minimumQueryLength;

  const canSearch = enabled && hasMinimumLength && !isDebouncing;

  const search = useQuery({
    queryKey: [
      "places",
      "search",
      debouncedQuery,
      proximity?.latitude ?? null,
      proximity?.longitude ?? null,
      permanent,
    ],

    queryFn: ({ signal }) =>
      geocodingService.searchPlaces({
        query: debouncedQuery,
        proximity,
        signal,
        permanent,
      }),

    enabled: canSearch,

    staleTime: 0,

    gcTime: 0,

    refetchOnWindowFocus: false,

    retry: (failureCount, error) => {
      if (
        error instanceof PlaceSearchError &&
        error.status !== undefined &&
        error.status < 500
      ) {
        return false;
      }

      return failureCount < 1;
    },
  });

  return {
    results: canSearch ? (search.data ?? []) : [],

    isLoading:
      enabled && hasMinimumLength && (isDebouncing || search.isPending),

    isFetching: canSearch && search.isFetching,

    isOffline: canSearch && search.fetchStatus === "paused",

    isEmpty: canSearch && search.isSuccess && search.data.length === 0,

    error: canSearch ? search.error : null,

    hasMinimumLength,

    retry: search.refetch,
  };
}
