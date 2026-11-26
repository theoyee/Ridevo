import { View } from "react-native";

import { CarFront } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import { useTripProgress } from "../hooks/useTripProgress";

import type { Ride } from "../types/ride.types";

interface TripProgressCardProps {
  ride: Ride;
}

export function TripProgressCard({ ride }: TripProgressCardProps) {
  const { percentage, remainingSeconds } = useTripProgress(ride);

  return (
    <View className="gap-4 rounded-3xl bg-surface p-5">
      <View className="flex-row items-center gap-3">
        <CarFront size={26} color="#101820" />

        <Typography variant="bodyMedium" className="flex-1">
          Journey progress
        </Typography>

        <Typography variant="h3">{percentage}%</Typography>
      </View>

      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Journey progress"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: percentage,
        }}
        className="h-2 overflow-hidden rounded-full bg-border"
      >
        <View
          className="h-full rounded-full bg-primary"
          style={{
            width: `${percentage}%`,
          }}
        />
      </View>

      <Typography variant="small" className="text-muted">
        {remainingSeconds > 0
          ? `${remainingSeconds} seconds remaining in simulation`
          : "Finalizing your trip..."}
      </Typography>
    </View>
  );
}
