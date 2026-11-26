import { create } from "zustand";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { rideSchema } from "../schemas/ride.schema";

import type { Ride } from "../types/ride.types";

interface ActiveRideState {
  ride: Ride | null;

  setRide: (ride: Ride) => void;

  clearRide: () => void;
}

export const useActiveRideStore = create<ActiveRideState>((set) => ({
  ride: null,

  setRide: (input) => {
    const ride = rideSchema.parse(input);

    const auth = useAuthStore.getState();

    if (
      auth.status !== "authenticated" ||
      auth.session?.user.id !== ride.userId
    ) {
      return;
    }

    set((state) => {
      const current = state.ride;

      if (current?.id === ride.id && current.version >= ride.version) {
        return state;
      }

      return {
        ride,
      };
    });
  },

  clearRide: () => {
    set({
      ride: null,
    });
  },
}));
