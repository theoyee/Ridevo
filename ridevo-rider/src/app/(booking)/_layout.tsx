import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

export default function BookingLayout() {
  const status = useAuthStore((state) => state.status);

  const session = useAuthStore((state) => state.session);

  if (status === "initializing") {
    return null;
  }

  if (status === "error") {
    return <Redirect href="/" />;
  }

  if (status !== "authenticated" || !session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (
    !session.user.profileCompleted ||
    session.onboardingStage !== "completed"
  ) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,

        animation: "slide_from_right",

        gestureEnabled: true,

        contentStyle: {
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <Stack.Screen name="destination-search" />

      <Stack.Screen name="confirm-pickup" />
    </Stack>
  );
}
