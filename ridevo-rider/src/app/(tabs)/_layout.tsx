import { Redirect, Tabs } from "expo-router";
import { House } from "lucide-react-native";

import { useAuthStore } from "@/features/auth/stores/auth.store";
import { getAuthenticatedRoute } from "@/features/auth/utils/auth-navigation";

export default function TabsLayout() {
  const status = useAuthStore((state) => state.status);

  const session = useAuthStore((state) => state.session);

  if (status === "initializing") {
    return null;
  }

  if (status === "error") {
    return <Redirect href="/" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Prevent incomplete onboarding from being bypassed.
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
        tabBarInactiveTintColor: "#98A2B3",

        tabBarHideOnKeyboard: true,

        tabBarLabelStyle: {
          fontFamily: "Inter-Medium",
          fontSize: 11,
        },

        tabBarStyle: {
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
          tabBarIcon: ({ color, size, focused }) => (
            <House
              color={color}
              size={size}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
    </Tabs>
  );
}
