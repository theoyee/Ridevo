import { useCallback } from "react";

import { useFocusEffect, useRouter } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { rideService } from "../services/ride.service";

import { useActiveRideStore } from "../stores/active-ride.store";

import { RIDE_CONFIG } from "../constants/ride.constants";

export function useActiveRideRecovery() {
  const router = useRouter();

  const userId = useAuthStore((state) => state.session?.user.id);

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return;
      }

      let disposed = false;

      async function recoverRide() {
        try {
          const ride = await rideService.getActiveRide();

          if (disposed || useAuthStore.getState().session?.user.id !== userId) {
            return;
          }

          if (!ride) {
            useActiveRideStore.getState().clearRide();

            return;
          }

          useActiveRideStore.getState().setRide(ride);

          router.replace(RIDE_CONFIG.routes.activeRide);
        } catch (error) {
          if (__DEV__ && !disposed) {
            console.warn("[Ridevo] Active ride recovery failed:", error);
          }
        }
      }

      void recoverRide();

      return () => {
        disposed = true;
      };
    }, [userId, router]),
  );
}
