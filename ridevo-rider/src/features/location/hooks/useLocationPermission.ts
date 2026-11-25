import { useCallback, useEffect } from "react";

import { AppState } from "react-native";

import { useMutation } from "@tanstack/react-query";

import { locationService } from "../services/location.service";
import { useLocationStore } from "../stores/location.store";

export function useLocationPermission() {
  const permission = useLocationStore((state) => state.permission);

  const servicesEnabled = useLocationStore((state) => state.servicesEnabled);

  const setPermission = useLocationStore((state) => state.setPermission);

  const setServicesEnabled = useLocationStore(
    (state) => state.setServicesEnabled,
  );

  const refreshPermission = useCallback(async () => {
    const current = await locationService.getPermission();

    setPermission(current);

    const enabled = await locationService.isServicesEnabled();

    setServicesEnabled(enabled);

    return current;
  }, [setPermission, setServicesEnabled]);

  const requestMutation = useMutation({
    mutationKey: ["location", "permission"],

    mutationFn: async () => {
      const result = await locationService.requestPermission();

      setPermission(result);

      const enabled = await locationService.isServicesEnabled();

      setServicesEnabled(enabled);

      return result;
    },

    retry: false,
  });

  useEffect(() => {
    void refreshPermission().catch(() => {
      // Explicit permission requests can retry.
    });

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshPermission().catch(() => {
          // Do not crash when resuming the app.
        });
      }
    });

    return () => subscription.remove();
  }, [refreshPermission]);

  return {
    permission,

    servicesEnabled,

    refreshPermission,

    requestPermission: requestMutation.mutateAsync,

    isRequesting: requestMutation.isPending,

    error: requestMutation.error,

    openSettings: locationService.openSettings,
  };
}
