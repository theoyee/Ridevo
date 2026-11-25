import { useEffect } from "react";
import { Platform } from "react-native";

import { notificationService } from "../services/notification.service";
import { useNotificationStore } from "../stores/notification.store";

export function useNotificationBootstrap() {
  useEffect(() => {
    if (Platform.OS === "web") return;

    let active = true;

    async function initialize() {
      try {
        await notificationService.configureChannels();

        const permission = await notificationService.getPermission();

        if (active) {
          useNotificationStore.getState().setPermission(permission);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Notification initialization failed:", error);
        }
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);
}
