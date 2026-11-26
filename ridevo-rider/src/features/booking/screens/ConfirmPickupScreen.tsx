import { Pressable, View } from "react-native";

import { ArrowLeft, LocateFixed, MapPin } from "lucide-react-native";

import { useRouter } from "expo-router";

import { Screen } from "@/components/layout/Screen";

import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useBookingStore } from "../stores/booking.store";

import { BOOKING_CONFIG } from "../constants/booking.constants";

export function ConfirmPickupScreen() {
  const router = useRouter();

  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) =>
    userId && state.draft?.userId === userId ? state.draft : null,
  );

  const pickupLabel =
    draft?.pickup?.address ??
    (draft?.pickup?.source === "gps"
      ? "Current location"
      : "Choose your pickup location");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();

      return;
    }

    router.replace("/(tabs)");
  };

  const handleChangePickup = () => {
    router.push({
      pathname: BOOKING_CONFIG.routes.destinationSearch,

      params: {
        mode: "pickup",
      },
    });
  };

  return (
    <Screen>
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row items-center gap-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            className="h-12 w-12 items-center justify-center rounded-full bg-surface active:opacity-70"
          >
            <ArrowLeft size={24} color="#101820" strokeWidth={1.8} />
          </Pressable>

          <Typography variant="h2">Confirm pickup</Typography>
        </View>

        <View className="mt-8 rounded-2xl bg-surface p-4">
          <View className="flex-row items-center gap-3">
            <LocateFixed size={24} color="#2563EB" />

            <View className="flex-1">
              <Typography variant="caption" className="text-muted">
                Pickup
              </Typography>

              <Typography variant="bodyMedium">{pickupLabel}</Typography>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleChangePickup}
            className="mt-3 min-h-12 justify-center"
          >
            <Typography variant="bodyMedium">Change pickup</Typography>
          </Pressable>
        </View>

        {draft?.destination && (
          <View className="mt-4 flex-row items-center gap-3 rounded-2xl bg-surface p-4">
            <MapPin size={24} color="#101820" />

            <View className="flex-1">
              <Typography variant="caption" className="text-muted">
                Destination
              </Typography>

              <Typography variant="bodyMedium">
                {draft.destination.name}
              </Typography>

              <Typography variant="small" className="mt-1 text-muted">
                {draft.destination.address}
              </Typography>
            </View>
          </View>
        )}

        <View className="mt-6">
          <Typography variant="small" className="text-muted">
            Interactive map confirmation will be implemented in R10.
          </Typography>
        </View>
      </View>
    </Screen>
  );
}
