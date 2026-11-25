import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log("[Notifications] Received:", notification);

    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },

  handleError: (identifier, error) => {
    console.error("[Notifications] Handler error:", identifier, error);
  },
});
