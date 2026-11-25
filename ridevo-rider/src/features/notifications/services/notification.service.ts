import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { Linking, Platform } from "react-native";

import type {
  NotificationPermission,
  PushRegistration,
} from "../types/notification.types";

function mapPermission(
  permission: Notifications.NotificationPermissionsStatus,
): NotificationPermission {
  const granted =
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

  return {
    granted,

    canAskAgain: permission.canAskAgain,

    status: granted
      ? "granted"
      : permission.status === "undetermined"
        ? "undetermined"
        : permission.canAskAgain
          ? "denied"
          : "blocked",
  };
}

export const notificationService = {
  async configureChannels(): Promise<void> {
    if (Platform.OS !== "android") return;

    try {
      await Notifications.setNotificationChannelAsync("ride-updates", {
        name: "Ride updates",
        importance: Notifications.AndroidImportance.HIGH,
      });

      console.log("[Notifications] Channel configured");
    } catch (error) {
      console.warn("[Notifications] Channel configuration failed:", error);
    }
  },

  async getPermission(): Promise<NotificationPermission> {
    const permission = await Notifications.getPermissionsAsync();

    return mapPermission(permission);
  },

  async requestPermission(): Promise<NotificationPermission> {
    await this.configureChannels();

    const current = await Notifications.getPermissionsAsync();

    const mapped = mapPermission(current);

    if (mapped.granted || !mapped.canAskAgain) {
      return mapped;
    }

    const permission = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    return mapPermission(permission);
  },

  async registerForPush(): Promise<PushRegistration> {
    if (Platform.OS !== "android" && Platform.OS !== "ios") {
      throw new Error("Push registration requires Android or iOS.");
    }

    if (!Device.isDevice) {
      throw new Error("Push notifications require a physical device.");
    }

    await this.configureChannels();

    const permission = await this.getPermission();

    if (!permission.granted) {
      throw new Error("Notification permission has not been granted.");
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      throw new Error("EAS project ID is not configured.");
    }

    const response = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return {
      token: response.data,
      platform: Platform.OS,
      provider: "expo",
    };
  },

  async openSettings(): Promise<void> {
    await Linking.openSettings();
  },

  async sendTestNotification(): Promise<string> {
    await this.configureChannels();

    const permission = await Notifications.getPermissionsAsync();

    console.log("[Notifications] Permission:", permission);

    if (!permission.granted) {
      throw new Error("Notification permission is not granted.");
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your driver is here",
        body: "Meet your driver at the pickup point.",
        data: {
          type: "driver.arrived",
          test: true,
        },
      },
      trigger: {
        channelId: "ride-updates",
      },
    });

    console.log("[Notifications] Scheduled:", id);

    return id;
  },

  // async sendTestNotification(): Promise<string> {
  //   console.log("[Notifications] Starting test");

  //   await this.configureChannels();

  //   const permission = await Notifications.getPermissionsAsync();

  //   console.log("[Notifications] Permission:", permission);

  //   if (!permission.granted) {
  //     throw new Error("Notification permission is not granted.");
  //   }

  //   const identifier = await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "Your driver is here",
  //       body: "Meet your driver at the pickup point.",
  //       sound: "default",
  //       data: {
  //         type: "driver.arrived",
  //         test: true,
  //       },
  //     },
  //     trigger: null,
  //   });

  //   console.log("[Notifications] Scheduled:", identifier);

  //   return identifier;
  // },
};
