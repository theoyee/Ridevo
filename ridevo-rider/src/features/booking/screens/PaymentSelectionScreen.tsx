import { useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import {
  Banknote,
  CarFront,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Wallet,
} from "lucide-react-native";

import { Screen } from "@/components/layout/Screen";

import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { rideService } from "@/features/rides/services/ride.service";

import { useActiveRideStore } from "@/features/rides/stores/active-ride.store";

import { RIDE_CONFIG } from "@/features/rides/constants/ride.constants";

import { isTerminalRideStatus } from "@/features/rides/utils/ride-status.utils";

import { BookingHeader } from "../components/BookingHeader";

import { useBookingStore } from "../stores/booking.store";

import { formatFare } from "../utils/fare.utils";

const PAYMENT_OPTIONS = [
  {
    id: "cash",
    name: "Cash",
    description: "Pay your driver after the trip",
    Icon: Banknote,
    available: true,
  },

  {
    id: "card",
    name: "Debit card",
    description: "Coming soon",
    Icon: CreditCard,
    available: false,
  },

  {
    id: "wallet",
    name: "Ridevo Wallet",
    description: "Coming soon",
    Icon: Wallet,
    available: false,
  },
] as const;

export function PaymentSelectionScreen() {
  const router = useRouter();

  const submissionLock = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) =>
    userId && state.draft?.userId === userId ? state.draft : null,
  );

  const vehicle = draft?.selectedVehicle;

  const handleBack = () => {
    if (submissionLock.current) {
      return;
    }

    if (router.canGoBack()) {
      router.back();

      return;
    }

    router.replace("/(tabs)");
  };

  const handleRequestRide = async () => {
    if (
      submissionLock.current ||
      !userId ||
      !draft?.pickup ||
      !draft.destination ||
      !draft.pickupConfirmed ||
      !draft.destinationConfirmed ||
      !vehicle
    ) {
      return;
    }

    submissionLock.current = true;

    setIsSubmitting(true);

    let succeeded = false;

    try {
      const ride = await rideService.createRide({
        idempotencyKey: `booking-${draft.createdAt}-${vehicle.selectedAt}`,

        pickup: draft.pickup,

        destination: draft.destination,

        category: vehicle.category,

        paymentMethod: "cash",

        estimatedFareMinor: vehicle.estimatedFareMinor,

        currency: "NGN",
      });

      if (useAuthStore.getState().session?.user.id !== userId) {
        return;
      }

      if (isTerminalRideStatus(ride.status)) {
        throw new Error("This booking has already ended. Start a new booking.");
      }

      useActiveRideStore.getState().setRide(ride);

      router.replace(RIDE_CONFIG.routes.activeRide);

      succeeded = true;
    } catch (error) {
      Alert.alert(
        "Unable to request ride",

        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      if (!succeeded) {
        submissionLock.current = false;

        setIsSubmitting(false);
      }
    }
  };

  return (
    <Screen>
      <View className="flex-1">
        <BookingHeader title="Payment" onBack={handleBack} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 24,
            gap: 24,
          }}
        >
          <View className="gap-3 rounded-3xl bg-surface p-5">
            <Typography variant="small" className="text-muted">
              Estimated fare
            </Typography>

            <Typography variant="display">
              {vehicle ? formatFare(vehicle.estimatedFareMinor) : "—"}
            </Typography>

            <View className="flex-row items-center gap-2">
              <CarFront size={22} color="#667085" />

              <Typography variant="bodyMedium" className="capitalize">
                Ridevo {vehicle?.category}
              </Typography>
            </View>
          </View>

          <View className="gap-3">
            <Typography variant="h3">Payment method</Typography>

            {PAYMENT_OPTIONS.map((option) => {
              const Icon = option.Icon;

              const selected = option.id === "cash";

              return (
                <View
                  key={option.id}
                  accessible
                  accessibilityRole="radio"
                  accessibilityLabel={`${option.name}, ${option.description}`}
                  accessibilityState={{
                    checked: selected,
                    disabled: !option.available,
                  }}
                  className="min-h-[84px] flex-row items-center gap-4 rounded-2xl border p-4"
                  style={{
                    backgroundColor: selected ? "#F0F8E0" : "#FFFFFF",

                    borderColor: selected ? "#101820" : "#E4E7EC",
                  }}
                >
                  <Icon
                    size={28}
                    color={option.available ? "#101820" : "#98A2B3"}
                    strokeWidth={1.7}
                  />

                  <View className="flex-1">
                    <Typography variant="bodyMedium">{option.name}</Typography>

                    <Typography variant="small" className="mt-1 text-muted">
                      {option.description}
                    </Typography>
                  </View>

                  {selected ? (
                    <CheckCircle2 size={22} color="#15803D" />
                  ) : (
                    <LockKeyhole size={18} color="#98A2B3" />
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View className="gap-3 px-6 pb-4 pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: isSubmitting || !vehicle,
              busy: isSubmitting,
            }}
            disabled={isSubmitting || !vehicle}
            onPress={() => void handleRequestRide()}
            className="min-h-14 flex-row items-center justify-center gap-3 rounded-full bg-accent active:opacity-80 disabled:opacity-50"
          >
            {isSubmitting && <ActivityIndicator color="#101820" />}

            <Typography variant="bodyMedium">
              {isSubmitting ? "Requesting ride..." : "Request ride"}
            </Typography>
          </Pressable>

          <Typography variant="caption" className="text-center text-muted">
            You will pay your driver after the trip.
          </Typography>
        </View>
      </View>
    </Screen>
  );
}
