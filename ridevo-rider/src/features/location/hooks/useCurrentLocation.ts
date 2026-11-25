import { useMutation } from "@tanstack/react-query";

import { locationService } from "../services/location.service";
import { useLocationStore } from "../stores/location.store";

import { classifyAccuracy, isSuitableForPickup } from "../utils/location.utils";

export function useCurrentLocation() {
  const location = useLocationStore((state) => state.currentLocation);

  const setCurrentLocation = useLocationStore(
    (state) => state.setCurrentLocation,
  );

  const mutation = useMutation({
    mutationKey: ["location", "current"],

    mutationFn: async () => {
      const position = await locationService.getCurrentLocation();

      const permission = await locationService.getPermission();

      useLocationStore.getState().setPermission(permission);

      if (!permission.granted) {
        throw new Error("Location permission was revoked.");
      }

      return position;
    },

    onSuccess: (position) => {
      setCurrentLocation(position);
    },

    retry: false,
  });

  return {
    location,

    accuracy: classifyAccuracy(location?.accuracy ?? null),

    isSuitableForPickup: location ? isSuitableForPickup(location) : false,

    getCurrentLocation: mutation.mutateAsync,

    isLocating: mutation.isPending,

    error: mutation.error,

    reset: mutation.reset,
  };
}
