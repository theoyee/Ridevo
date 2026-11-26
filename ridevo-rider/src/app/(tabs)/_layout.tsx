import { Redirect, Tabs } from "expo-router";
import { ClipboardList, House, UserRound, Wallet } from "lucide-react-native";

import { useAuthStore } from "@/features/auth/stores/auth.store";
import { getAuthenticatedRoute } from "@/features/auth/utils/auth-navigation";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function TabsLayout() {
  const status = useAuthStore((state) => state.status);
  const session = useAuthStore((state) => state.session);

  const { bottom } = useSafeAreaInsets();

  // console.log(bottom);

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
      // initialRouteName="index"
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
          tabBarIcon: ({ color, focused }) => (
            <View
              className="h-8 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: focused ? "#C8F560" : "transparent",
              }}
            >
              <House
                size={24}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <View
              className="h-8 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: focused ? "#C8F560" : "transparent",
              }}
            >
              <ClipboardList
                size={24}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <View
              className="h-8 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: focused ? "#C8F560" : "transparent",
              }}
            >
              <Wallet
                size={24}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) => (
            <View
              className="h-8 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: focused ? "#C8F560" : "transparent",
              }}
            >
              <UserRound
                size={24}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
