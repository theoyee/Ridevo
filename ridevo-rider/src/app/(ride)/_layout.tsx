import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { getAuthenticatedRoute } from "@/features/auth/utils/auth-navigation";

export default function RideLayout() {
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

  if (
    !session.user.profileCompleted ||
    session.onboardingStage !== "completed"
  ) {
    return <Redirect href={getAuthenticatedRoute(session)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,

        gestureEnabled: false,

        animation: "fade",

        contentStyle: {
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <Stack.Screen name="active" />
    </Stack>
  );
}
