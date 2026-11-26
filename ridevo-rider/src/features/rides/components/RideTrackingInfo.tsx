import { View } from "react-native";

import { Navigation, Route } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

interface RideTrackingInfoProps {
  remainingMeters: number;
  remainingSeconds: number;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

export function RideTrackingInfo({
  remainingMeters,
  remainingSeconds,
}: RideTrackingInfoProps) {
  return (
    <View className="flex-row rounded-2xl bg-surface p-4">
      <View className="flex-1 gap-2">
        <Navigation size={20} color="#667085" />

        <Typography variant="h3">
          {Math.max(0, Math.ceil(remainingSeconds))}s
        </Typography>

        <Typography variant="caption" className="text-muted">
          Simulation time left
        </Typography>
      </View>

      <View className="mx-4 w-px bg-border" />

      <View className="flex-1 gap-2">
        <Route size={20} color="#667085" />

        <Typography variant="h3">{formatDistance(remainingMeters)}</Typography>

        <Typography variant="caption" className="text-muted">
          Remaining distance
        </Typography>
      </View>
    </View>
  );
}
