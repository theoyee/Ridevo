import { Redirect, Tabs } from "expo-router";
import {
  ClipboardList,
  House,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth/stores/auth.store";
import { getAuthenticatedRoute } from "@/features/auth/utils/auth-navigation";

export const unstable_settings = {
  initialRouteName: "index",
};

interface TabIconProps {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
}

function TabIcon({ Icon, color, focused }: TabIconProps) {
  return (
    <View
      className="h-8 w-16 items-center justify-center rounded-full"
      style={{
        backgroundColor: focused ? "#C8F560" : "transparent",
      }}
    >
      <Icon size={24} color={color} strokeWidth={focused ? 2.4 : 1.8} />
    </View>
  );
}

export default function TabsLayout() {
  const status = useAuthStore((state) => state.status);
  const session = useAuthStore((state) => state.session);

  const { bottom } = useSafeAreaInsets();

  if (status === "initializing") {
    return null;
  }

  if (status === "error") {
    return <Redirect href="/" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (
    !session.user.profileCompleted ||
    session.onboardingStage !== "completed"
  ) {
    return <Redirect href={getAuthenticatedRoute(session)} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#101820",
        tabBarInactiveTintColor: "#667085",
        tabBarHideOnKeyboard: true,

        tabBarLabelStyle: {
          fontFamily: "Inter-Medium",
          fontSize: 11,
        },

        tabBarStyle: {
          height: 60 + bottom,
          paddingBottom: bottom,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E4E7EC",
          borderTopWidth: 1,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={House} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarAccessibilityLabel: "Ride activity",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={ClipboardList} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarAccessibilityLabel: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Wallet} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarAccessibilityLabel: "Account",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={UserRound} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
