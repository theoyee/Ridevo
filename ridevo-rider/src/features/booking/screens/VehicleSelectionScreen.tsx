import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { Wallet } from "lucide-react-native";

import { Screen } from "@/components/layout/Screen";
import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { BookingHeader } from "../components/BookingHeader";

import { BookingRouteMap } from "../components/BookingRouteMap";

import { VehicleOptionCard } from "../components/VehicleOptionCard";

import { useRideRoute } from "../hooks/useRideRoute";

import { useBookingStore } from "../stores/booking.store";

import { calculateVehicleOptions, formatFare } from "../utils/fare.utils";

import type { VehicleCategory, VehicleOption } from "../types/booking.types";

import { RIDE_CONFIG } from "@/features/rides/constants/ride.constants";

export function VehicleSelectionScreen() {
  const router = useRouter();

  const userId = useAuthStore((state) => state.session?.user.id);

  const existingCategory = useBookingStore((state) =>
    state.draft?.userId === userId
      ? state.draft?.selectedVehicle?.category
      : undefined,
  );

  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>(
    existingCategory ?? "economy",
  );

  const { route, isLoading, isFetching, error, retry } = useRideRoute();

  const options = useMemo(
    () => (route ? calculateVehicleOptions(route) : []),
    [route],
  );

  const selectedOption = options.find(
    (option) => option.category === selectedCategory,
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleSelectVehicle = (option: VehicleOption) => {
    setSelectedCategory(option.category);
  };

  const handleContinue = () => {
    if (!userId || !selectedOption || isFetching || error) {
      return;
    }

    try {
      useBookingStore.getState().selectVehicle(userId, {
        category: selectedOption.category,

        estimatedFareMinor: selectedOption.estimatedFareMinor,

        currency: selectedOption.currency,

        selectedAt: Date.now(),
      });

      // Temporary until R13 is implemented.
      // Alert.alert(
      //   "Vehicle selected",
      //   `${selectedOption.name} — ${formatFare(
      //     selectedOption.estimatedFareMinor,
      //   )}`,
      // );

      router.push(RIDE_CONFIG.routes.paymentSelection);
    } catch (cause) {
      Alert.alert(
        "Unable to select vehicle",

        cause instanceof Error ? cause.message : "Please try again.",
      );
    }
  };

  const canContinue = Boolean(selectedOption && !isFetching && !error);

  return (
    <Screen>
      <View className="flex-1">
        <BookingHeader title="Choose a ride" onBack={handleBack} />

        <View className="min-h-[140px] flex-1">
          <BookingRouteMap route={route} />
        </View>

        <ScrollView
          className="max-h-[65%] bg-white"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 16,
            gap: 12,
          }}
        >
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Typography variant="h3">Available rides</Typography>

            {route && (
              <Typography variant="caption" className="text-muted">
                {(route.distanceMeters / 1000).toFixed(1)} km
                {" · "}
                {Math.ceil(route.durationSeconds / 60)} min
              </Typography>
            )}
          </View>

          {isLoading || isFetching ? (
            <View className="items-center gap-3 py-8">
              <ActivityIndicator color="#101820" />

              <Typography variant="small" className="text-muted">
                Calculating fares...
              </Typography>
            </View>
          ) : error ? (
            <View className="gap-3 rounded-2xl bg-surface p-4">
              <Typography variant="bodyMedium">
                Unable to calculate fares
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
          ) : (
            <View accessibilityRole="radiogroup" className="gap-3">
              {options.map((option) => (
                <VehicleOptionCard
                  key={option.category}
                  option={option}
                  selected={option.category === selectedCategory}
                  onPress={handleSelectVehicle}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View className="gap-3 border-t border-border bg-white px-6 pb-4 pt-4">
          <View className="flex-row items-center gap-3">
            <Wallet size={23} color="#667085" strokeWidth={1.8} />

            <Typography variant="small" className="flex-1 text-muted">
              Estimated fare
            </Typography>

            <Typography variant="h3">
              {selectedOption
                ? formatFare(selectedOption.estimatedFareMinor)
                : "—"}
            </Typography>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: !canContinue,
            }}
            disabled={!canContinue}
            onPress={handleContinue}
            className="min-h-14 items-center justify-center rounded-full bg-accent active:opacity-80 disabled:opacity-50"
          >
            <Typography variant="bodyMedium">
              {selectedOption
                ? `Choose ${selectedOption.name}`
                : "Choose a ride"}
            </Typography>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
