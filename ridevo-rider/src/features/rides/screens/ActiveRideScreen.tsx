import { useRef, useState, useCallback } from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";

import { CheckCircle2, MapPin, XCircle } from "lucide-react-native";

import { Screen } from "@/components/layout/Screen";

import { Typography } from "@/components/ui/Typography";

import { useBookingStore } from "@/features/booking/stores/booking.store";

import { formatFare } from "@/features/booking/utils/fare.utils";

import { useActiveRide } from "../hooks/useActiveRide";

import { rideService } from "../services/ride.service";

import { useActiveRideStore } from "../stores/active-ride.store";

import {
  canCancelRide,
  isTerminalRideStatus,
} from "../utils/ride-status.utils";

import { DriverMatchingRadar } from "../components/DriverMatchingRadar";

import { AssignedDriverCard } from "../components/AssignedDriverCard";

import type { RideStatus } from "../types/ride.types";

import { DriverSimulatorPanel } from "../components/DriverSimulatorPanel";

import { TripProgressCard } from "../components/TripProgressCard";

import { TripSummaryCard } from "../components/TripSummaryCard";

import { ActiveRideMap } from "../components/ActiveRideMap";
import { DriverRatingCard } from "../components/DriverRatingCard";

// import { useCallback, useRef, useState } from "react";

const STATUS_CONTENT: Record<
  RideStatus,
  {
    title: string;
    description: string;
  }
> = {
  searching: {
    title: "Finding your driver",
    description: "We're connecting you with a nearby driver.",
  },

  accepted: {
    title: "Driver found",
    description: "Your driver has accepted the ride.",
  },

  arriving: {
    title: "Driver is arriving",
    description: "Your driver is on the way to your pickup.",
  },

  arrived: {
    title: "Your driver has arrived",
    description: "Meet your driver at the pickup location.",
  },

  in_progress: {
    title: "On your way",
    description: "Your trip is in progress.",
  },

  completed: {
    title: "Trip completed",
    description: "Thank you for riding with Ridevo.",
  },

  cancelled: {
    title: "Ride cancelled",
    description: "Your ride has been cancelled.",
  },

  unmatched: {
    title: "No drivers available",
    description: "Please try requesting another ride.",
  },
};

export function ActiveRideScreen() {
  const router = useRouter();


  

  const { ride, error, refresh } = useActiveRide();

  const cancellationLock = useRef(false);

  const [isCancelling, setIsCancelling] = useState(false);


  const shouldPreventBack = Boolean(
    ride &&
    (!isTerminalRideStatus(ride.status) ||
      (ride.status === "completed" && ride.paymentStatus === "pending")),
  );

  useFocusEffect(
    useCallback(() => {
      if (!shouldPreventBack) {
        return;
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );

      return () => {
        subscription.remove();
      };
    }, [shouldPreventBack]),
  );

  const handleCancel = async () => {
    if (cancellationLock.current || !ride || !canCancelRide(ride.status)) {
      return;
    }

    cancellationLock.current = true;

    setIsCancelling(true);

    try {
      const cancelledRide = await rideService.cancelRide(
        ride.id,
        "rider_cancelled",
      );

      useActiveRideStore.getState().setRide(cancelledRide);
    } catch (cause) {
      Alert.alert(
        "Unable to cancel ride",

        cause instanceof Error ? cause.message : "Please try again.",
      );
    } finally {
      cancellationLock.current = false;

      setIsCancelling(false);
    }
  };

  const confirmCancellation = () => {
    Alert.alert(
      "Cancel ride?",

      "Are you sure you want to cancel this ride?",

      [
        {
          text: "Keep ride",
          style: "cancel",
        },

        {
          text: "Cancel ride",
          style: "destructive",
          onPress: () => void handleCancel(),
        },
      ],
    );
  };

  const handleReturnHome = () => {
    if (ride && !isTerminalRideStatus(ride.status)) {
      return;
    }

    if (ride?.status === "completed" && ride.paymentStatus === "pending") {
      Alert.alert("Payment pending", "Cash payment must be confirmed first.");

      return;
    }

    useActiveRideStore.getState().clearRide();

    useBookingStore.getState().resetBooking();

    router.dismissAll();

    router.replace("/(tabs)");
  };

  if (!ride) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Typography variant="h2">No active ride</Typography>

          <Pressable
            accessibilityRole="button"
            onPress={handleReturnHome}
            className="min-h-14 justify-center rounded-full bg-accent px-8"
          >
            <Typography variant="bodyMedium">Return home</Typography>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const content = STATUS_CONTENT[ride.status];

  const terminal = isTerminalRideStatus(ride.status);

  const showTrackingMap =
    ride.status === "accepted" ||
    ride.status === "arriving" ||
    ride.status === "arrived" ||
    ride.status === "in_progress";

  return (
    <Screen>
      <View className="flex-1">
        {showTrackingMap && (
          <View className="min-h-[180px] flex-1">
            <ActiveRideMap key={ride.id} ride={ride} />
          </View>
        )}

        <ScrollView
          className={showTrackingMap ? "max-h-[55%]" : "flex-1"}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 24,
            gap: 20,
            flexGrow: 1,
          }}

          keyboardShouldPersistTaps="handled"
        >
          <View
            className={
              showTrackingMap ? "items-center gap-3" : "items-center gap-4 pt-8"
            }
          >
            {ride.status === "searching" ? (
              <DriverMatchingRadar />
            ) : terminal ? (
              <View className="h-24 w-24 items-center justify-center rounded-full bg-surface">
                {ride.status === "completed" ? (
                  <CheckCircle2 size={48} color="#15803D" />
                ) : (
                  <XCircle size={48} color="#667085" />
                )}
              </View>
            ) : null}

            <View
              accessibilityLiveRegion="polite"
              className="items-center gap-2"
            >
              <Typography variant="h2" className="text-center">
                {content.title}
              </Typography>

              <Typography variant="body" className="text-center text-muted">
                {content.description}
              </Typography>
            </View>
          </View>

          {error && !terminal && (
            <View className="gap-2 rounded-2xl bg-surface p-4">
              <Typography variant="small">
                Unable to refresh your ride.
              </Typography>

              <Pressable
                accessibilityRole="button"
                onPress={() => void refresh()}
                className="min-h-12 justify-center"
              >
                <Typography variant="bodyMedium">Retry</Typography>
              </Pressable>
            </View>
          )}

          {!terminal && <AssignedDriverCard ride={ride} />}

          {ride.status === "arrived" && ride.verificationPin && (
            <View className="items-center gap-3 rounded-3xl bg-[#F0F8E0] p-5">
              <Typography variant="bodyMedium">
                Trip verification PIN
              </Typography>

              <View className="flex-row gap-3">
                {ride.verificationPin.split("").map((digit, index) => (
                  <View
                    key={index}
                    className="h-14 w-12 items-center justify-center rounded-xl bg-white"
                  >
                    <Typography variant="h2">{digit}</Typography>
                  </View>
                ))}
              </View>

              <Typography variant="caption" className="text-center text-muted">
                Share this PIN only with your assigned driver when you enter the
                vehicle.
              </Typography>
            </View>
          )}

          <View className="gap-4 rounded-2xl bg-surface p-4">
            <View className="flex-row items-center gap-3">
              <MapPin size={22} color="#2563EB" />

              <View className="flex-1">
                <Typography variant="caption" className="text-muted">
                  Pickup
                </Typography>

                <Typography variant="bodyMedium">
                  {ride.pickup.address ??
                    ride.pickup.name ??
                    "Selected pickup point"}
                </Typography>
              </View>
            </View>

            <View className="h-px bg-border" />

            <View className="flex-row items-center gap-3">
              <MapPin size={22} color="#101820" />

              <View className="flex-1">
                <Typography variant="caption" className="text-muted">
                  Destination
                </Typography>

                <Typography variant="bodyMedium">
                  {ride.destination.name}
                </Typography>
              </View>
            </View>
          </View>

          {ride.status === "in_progress" && __DEV__ && (
            <TripProgressCard key={ride.id} ride={ride} />
          )}

          {ride.status === "completed" && <TripSummaryCard ride={ride} />}

          {__DEV__ && <DriverSimulatorPanel key={ride.id} ride={ride} />}

          {ride.status === "completed" && ride.paymentStatus === "paid" && (
            <DriverRatingCard key={ride.id} ride={ride} />
          )}

          {ride.status !== "completed" && (
            <View className="flex-row items-center justify-between">
              <Typography variant="small" className="text-muted">
                Estimated fare · Cash
              </Typography>

              <Typography variant="h3">
                {formatFare(ride.estimatedFareMinor)}
              </Typography>
            </View>
          )}
        </ScrollView>

        <View className="gap-3 px-6 pb-4 pt-3">
          {terminal ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleReturnHome}
              className="min-h-14 items-center justify-center rounded-full bg-accent"
            >
              <Typography variant="bodyMedium">Return home</Typography>
            </Pressable>
          ) : canCancelRide(ride.status) ? (
            <Pressable
              accessibilityRole="button"
              disabled={isCancelling}
              onPress={confirmCancellation}
              className="min-h-14 flex-row items-center justify-center gap-3 rounded-full border border-border disabled:opacity-50"
            >
              {isCancelling && <ActivityIndicator color="#DC2626" />}

              <Typography variant="bodyMedium" className="text-error">
                {isCancelling ? "Cancelling..." : "Cancel ride"}
              </Typography>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
