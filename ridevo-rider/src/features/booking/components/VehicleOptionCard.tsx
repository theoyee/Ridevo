import { memo } from "react";

import { Pressable, View } from "react-native";

import { CarFront, CheckCircle2, UserRound } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import type { VehicleOption } from "../types/booking.types";

import { formatFare } from "../utils/fare.utils";

interface VehicleOptionCardProps {
  option: VehicleOption;
  selected: boolean;
  onPress: (option: VehicleOption) => void;
}

export const VehicleOptionCard = memo(function VehicleOptionCard({
  option,
  selected,
  onPress,
}: VehicleOptionCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{
        checked: selected,
      }}
      accessibilityLabel={`${option.name}, ${formatFare(option.estimatedFareMinor)}, ${option.capacity} passengers`}
      onPress={() => onPress(option)}
      className="min-h-[100px] flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-80"
      style={{
        backgroundColor: selected ? "#F0F8E0" : "#FFFFFF",

        borderColor: selected ? "#101820" : "#E4E7EC",
      }}
    >
      <View className="h-14 w-14 items-center justify-center rounded-xl bg-surface">
        <CarFront size={34} color="#101820" strokeWidth={1.5} />
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Typography variant="bodyMedium">{option.name}</Typography>

          <View className="flex-row items-center gap-1">
            <UserRound size={13} color="#667085" />

            <Typography variant="caption" className="text-muted">
              {option.capacity}
            </Typography>
          </View>
        </View>

        <Typography variant="caption" className="mt-1 text-muted">
          {option.description}
        </Typography>
      </View>

      <View className="items-end gap-2">
        <Typography variant="bodyMedium">
          {formatFare(option.estimatedFareMinor)}
        </Typography>

        {selected && <CheckCircle2 size={19} color="#15803D" />}
      </View>
    </Pressable>
  );
});
