import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { Clock3, Route } from "lucide-react-native";

import { Screen } from "@/components/layout/Screen";
import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { BookingHeader } from "../components/BookingHeader";

import { BookingRouteMap } from "../components/BookingRouteMap";

import { useBookingStore } from "../stores/booking.store";

import { useRideRoute } from "../hooks/useRideRoute";

import { BOOKING_CONFIG } from "../constants/booking.constants";

export function ConfirmDestinationScreen() {
  const router = useRouter();

  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) =>
    userId && state.draft?.userId === userId ? state.draft : null,
  );

  const { route, isLoading, isFetching, error, retry } = useRideRoute();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleConfirm = () => {
    if (!userId || !route || isFetching || error) {
      return;
    }

    try {
      useBookingStore.getState().confirmDestination(userId);

      router.push(BOOKING_CONFIG.routes.vehicleSelection);
    } catch (cause) {
      Alert.alert(
        "Unable to confirm destination",

        cause instanceof Error ? cause.message : "Please try again.",
      );
    }
  };

  const canConfirm = Boolean(route && !isFetching && !error);

  return (
    <Screen>
      <View className="flex-1">
        <BookingHeader title="Confirm destination" onBack={handleBack} />

        <View className="min-h-[180px] flex-1">
          <BookingRouteMap route={route} />
        </View>

        <ScrollView
          className="max-h-[55%] bg-white"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 24,
            gap: 16,
          }}
        >
          <Typography variant="h2">Your journey</Typography>

          <View className="flex-row gap-4 rounded-2xl bg-surface p-4">
            <View className="items-center pt-2">
              <View className="h-3 w-3 rounded-full bg-info" />

              <View className="my-2 min-h-8 w-0.5 flex-1 bg-border" />

              <View className="h-3 w-3 rounded-sm bg-primary" />
            </View>

            <View className="flex-1 gap-4">
              <View>
                <Typography variant="caption" className="text-muted">
                  Pickup
                </Typography>

                <Typography variant="bodyMedium">
                  {draft?.pickup?.address ??
                    draft?.pickup?.name ??
                    "Selected pickup point"}
                </Typography>
              </View>

              <View className="h-px bg-border" />

              <View>
                <Typography variant="caption" className="text-muted">
                  Destination
                </Typography>

                <Typography variant="bodyMedium">
                  {draft?.destination?.name}
                </Typography>

                <Typography variant="small" className="mt-1 text-muted">
                  {draft?.destination?.address}
                </Typography>
              </View>
            </View>
          </View>

          {isLoading || isFetching ? (
            <View className="flex-row items-center justify-center gap-3 py-4">
              <ActivityIndicator color="#101820" />

              <Typography variant="small" className="text-muted">
                Calculating your route...
              </Typography>
            </View>
          ) : error ? (
            <View className="gap-3 rounded-2xl bg-surface p-4">
              <Typography variant="bodyMedium">
                Unable to calculate route
              </Typography>

              <Typography variant="small" className="text-muted">
                {error.message}
              </Typography>

              <Pressable
                accessibilityRole="button"
                onPress={() => void retry()}
                className="min-h-12 justify-center"
              >
                <Typography variant="bodyMedium">Try again</Typography>
              </Pressable>
            </View>
          ) : route ? (
            <View className="flex-row gap-3">
              <View className="flex-1 gap-2 rounded-2xl bg-surface p-4">
                <Route size={22} color="#101820" />

                <Typography variant="h3">
                  {(route.distanceMeters / 1000).toFixed(1)} km
                </Typography>

                <Typography variant="caption" className="text-muted">
                  Distance
                </Typography>
              </View>

              <View className="flex-1 gap-2 rounded-2xl bg-surface p-4">
                <Clock3 size={22} color="#101820" />

                <Typography variant="h3">
                  {Math.ceil(route.durationSeconds / 60)} min
                </Typography>

                <Typography variant="caption" className="text-muted">
                  Estimated duration
                </Typography>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View className="bg-white px-6 pb-4 pt-2">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: !canConfirm,
            }}
            disabled={!canConfirm}
            onPress={handleConfirm}
            className="min-h-14 items-center justify-center rounded-full bg-accent active:opacity-80 disabled:opacity-50"
          >
            <Typography variant="bodyMedium">Confirm destination</Typography>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
