import "../global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import "@/features/notifications/services/notification-handler";

import { useNotificationBootstrap } from "@/features/notifications/hooks/useNotificationBootstrap";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/stores/auth.store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { useActiveRideStore } from "@/features/rides/stores/active-ride.store";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
  });

  useNotificationBootstrap();

  useEffect(() => {
    function synchronizeRideOwner() {
      const auth = useAuthStore.getState();

      const userId =
        auth.status === "authenticated" ? auth.session?.user.id : undefined;

      const activeRide = useActiveRideStore.getState().ride;

      if (activeRide && activeRide.userId !== userId) {
        useActiveRideStore.getState().clearRide();
      }
    }

    synchronizeRideOwner();

    return useAuthStore.subscribe(synchronizeRideOwner);
  }, []);

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />

            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: "#FFFFFF",
                },
              }}
            />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
