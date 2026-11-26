import { useQuery } from "@tanstack/react-query";

import { directionsService } from "@/features/booking/services/directions.service";

import { getMockDriverOrigin } from "../utils/mock-driver-location.utils";

import type { Ride } from "../types/ride.types";

export function useActiveRideRoute(ride: Ride) {
  const isApproaching =
    ride.status === "accepted" ||
    ride.status === "arriving" ||
    ride.status === "arrived";

  const isTrip = ride.status === "in_progress";

  const origin = isApproaching
    ? getMockDriverOrigin(ride.pickup.coordinates)
    : ride.pickup.coordinates;

  const destination = isApproaching
    ? ride.pickup.coordinates
    : ride.destination.coordinates;

  const query = useQuery({
    queryKey: [
      "rides",
      "route",
      ride.userId,
      ride.id,
      isApproaching ? "pickup" : "trip",
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude,
    ],

    queryFn: ({ signal }) =>
      directionsService.getRoute({
        pickup: origin,
        destination,
        signal,
      }),

    enabled: isApproaching || isTrip,

    staleTime: Infinity,

    gcTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    retry: false,
  });

  return {
    route: query.data ?? null,

    isLoading: query.isLoading,

    error: query.error,

    retry: query.refetch,
  };
}
