import { View } from "react-native";

import { CarFront, Star, UserRound } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import type { Ride } from "../types/ride.types";

interface AssignedDriverCardProps {
  ride: Ride;
}

export function AssignedDriverCard({ ride }: AssignedDriverCardProps) {
  const { driver, vehicle } = ride;

  if (!driver || !vehicle) {
    return null;
  }

  return (
    <View className="gap-4 rounded-3xl border border-border bg-white p-4">
      <View className="flex-row items-center gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
          <UserRound size={30} color="#667085" />
        </View>

        <View className="flex-1 gap-1">
          <Typography variant="h3">
            {driver.firstName} {driver.lastName}
          </Typography>

          <View className="flex-row items-center gap-1">
            <Star size={15} color="#D97706" fill="#D97706" />

            <Typography variant="small">{driver.rating.toFixed(1)}</Typography>
          </View>
        </View>

        <View className="items-center gap-1">
          <CarFront size={42} color="#101820" strokeWidth={1.4} />

          <Typography variant="caption" className="capitalize text-muted">
            {vehicle.category}
          </Typography>
        </View>
      </View>

      <View className="h-px bg-border" />

      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Typography variant="bodyMedium">
            {vehicle.manufacturer} {vehicle.model}
          </Typography>

          <Typography variant="small" className="mt-1 text-muted">
            {vehicle.color}
          </Typography>
        </View>

        <View className="rounded-lg border border-border bg-surface px-3 py-2">
          <Typography variant="bodyMedium">{vehicle.plateNumber}</Typography>
        </View>
      </View>
    </View>
  );
}
