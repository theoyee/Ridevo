import { useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { FlaskConical } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import { driverSimulatorService } from "../services/driver-simulator.service";

import { useActiveRideStore } from "../stores/active-ride.store";

import type { Ride } from "../types/ride.types";

interface DriverSimulatorPanelProps {
  ride: Ride;
}

export function DriverSimulatorPanel({ ride }: DriverSimulatorPanelProps) {
  const [pin, setPin] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  const operationLock = useRef(false);

  const canStart = ride.status === "arrived";

  const canComplete = ride.status === "in_progress";

  const canConfirmPayment =
    ride.status === "completed" &&
    ride.paymentMethod === "cash" &&
    ride.paymentStatus === "pending";

  async function execute(operation: () => Promise<Ride>) {
    if (operationLock.current || !__DEV__) {
      return;
    }

    operationLock.current = true;

    setIsProcessing(true);

    try {
      const updatedRide = await operation();

      useActiveRideStore.getState().setRide(updatedRide);
    } catch (cause) {
      Alert.alert(
        "Simulation failed",

        cause instanceof Error ? cause.message : "Please try again.",
      );
    } finally {
      operationLock.current = false;

      setIsProcessing(false);
    }
  }

  if (!__DEV__ || (!canStart && !canComplete && !canConfirmPayment)) {
    return null;
  }

  const disabled = isProcessing || (canStart && pin.length !== 4);

  const handlePress = () => {
    if (canStart) {
      void execute(() =>
        driverSimulatorService.startRide({
          rideId: ride.id,
          pin,
        }),
      );

      return;
    }

    if (canComplete) {
      void execute(() => driverSimulatorService.completeRide(ride.id));

      return;
    }

    if (canConfirmPayment) {
      void execute(() => driverSimulatorService.confirmCashPayment(ride.id));
    }
  };

  return (
    <View className="gap-4 rounded-2xl border border-[#D97706] p-4">
      <View className="flex-row items-center gap-2">
        <FlaskConical size={20} color="#D97706" />

        <Typography variant="bodyMedium" className="flex-1">
          Driver simulator
        </Typography>

        <Typography variant="caption" className="text-muted">
          DEV ONLY
        </Typography>
      </View>

      {canStart && (
        <TextInput
          accessibilityLabel="Passenger verification PIN"
          value={pin}
          onChangeText={(value) => {
            setPin(value.replace(/\D/g, "").slice(0, 4));
          }}
          placeholder="Enter passenger PIN"
          placeholderTextColor="#98A2B3"
          keyboardType="number-pad"
          maxLength={4}
          editable={!isProcessing}
          className="min-h-14 rounded-xl border border-border px-4 text-base text-primary"
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{
          disabled,
          busy: isProcessing,
        }}
        disabled={disabled}
        onPress={handlePress}
        className="min-h-14 flex-row items-center justify-center gap-3 rounded-full bg-primary px-4 disabled:opacity-50"
      >
        {isProcessing && <ActivityIndicator color="#FFFFFF" />}

        <Typography variant="bodyMedium" className="text-center text-white">
          {canStart
            ? "Verify PIN and start trip"
            : canComplete
              ? "Complete trip now"
              : "Confirm cash collected"}
        </Typography>
      </Pressable>
    </View>
  );
}
