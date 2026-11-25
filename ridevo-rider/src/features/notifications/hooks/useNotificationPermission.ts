import { useCallback, useEffect } from "react";

import { AppState } from "react-native";

import { useMutation } from "@tanstack/react-query";

import { notificationService } from "../services/notification.service";
import { useNotificationStore } from "../stores/notification.store";

export function useNotificationPermission() {
  const permission = useNotificationStore((state) => state.permission);

  const setPermission = useNotificationStore((state) => state.setPermission);

  const refreshPermission = useCallback(async () => {
    const current = await notificationService.getPermission();

    setPermission(current);

    return current;
  }, [setPermission]);

  const mutation = useMutation({
    mutationKey: ["notifications", "permission"],

    mutationFn: async () => {
      const result = await notificationService.requestPermission();

      setPermission(result);

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
          // Avoid unhandled errors on app resume.
        });
      }
    });

    return () => subscription.remove();
  }, [refreshPermission]);

  return {
    permission,

    refreshPermission,

    requestPermission: mutation.mutateAsync,

    isRequesting: mutation.isPending,

    error: mutation.error,

    openSettings: notificationService.openSettings,
  };
}
