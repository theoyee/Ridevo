import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useBookingStore } from "../stores/booking.store";

import { directionsService } from "../services/directions.service";

export function useRideRoute(enabled = true) {
  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) =>
    userId && state.draft?.userId === userId ? state.draft : null,
  );

  const pickup = draft?.pickup?.coordinates;

  const destination = draft?.destination?.coordinates;

  const canFetch = enabled && Boolean(userId && pickup && destination);

  const query = useQuery({
    queryKey: [
      "booking",
      "route",
      userId ?? null,
      pickup?.latitude ?? null,
      pickup?.longitude ?? null,
      destination?.latitude ?? null,
      destination?.longitude ?? null,
    ],

    queryFn: ({ signal }) => {
      if (!pickup || !destination) {
        throw new Error("Pickup and destination are required.");
      }

      return directionsService.getRoute({
        pickup,
        destination,
        signal,
      });
    },

    enabled: canFetch,

    staleTime: 60_000,

    gcTime: 0,

    refetchOnWindowFocus: false,

    retry: false,
  });

  return {
    route: canFetch ? (query.data ?? null) : null,

    isLoading: canFetch && query.isPending,

    isFetching: canFetch && query.isFetching,

    error: canFetch ? query.error : null,

    retry: query.refetch,
  };
}
