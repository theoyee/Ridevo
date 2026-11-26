import { memo } from "react";

import { Pressable, StyleSheet, View } from "react-native";

import { Bell } from "lucide-react-native";

import { BrandLogo } from "@/components/ui/BrandLogo";

import { HOME_CONFIG } from "../constants/home.constants";

interface HomeHeaderProps {
  onNotificationsPress: () => void;
  hasUnreadNotifications?: boolean;
}

export const HomeHeader = memo(function HomeHeader({
  onNotificationsPress,
  hasUnreadNotifications = false,
}: HomeHeaderProps) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View
        className="flex-row items-center justify-between rounded-full border border-border bg-white px-5 py-3"
        style={styles.header}
      >
        <BrandLogo
          width={HOME_CONFIG.header.logoWidth}
          height={HOME_CONFIG.header.logoHeight}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            hasUnreadNotifications
              ? "Notifications, unread messages"
              : "Notifications"
          }
          onPress={onNotificationsPress}
          className="relative h-12 w-12 items-center justify-center rounded-full bg-surface active:opacity-70"
        >
          <Bell size={22} color="#101820" strokeWidth={1.8} />

          {hasUnreadNotifications && (
            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-white bg-error" />
          )}
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: HOME_CONFIG.header.topSpacing,
    left: HOME_CONFIG.header.horizontalSpacing,
    right: HOME_CONFIG.header.horizontalSpacing,
    zIndex: 10,
  },

  header: {
    elevation: 3,
    shadowColor: "#101820",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
});
