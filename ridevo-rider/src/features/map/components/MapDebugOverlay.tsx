import { memo } from "react";

import { View } from "react-native";

import { Typography } from "@/components/ui/Typography";

interface MapDebugOverlayProps {
  isMapReady: boolean;
  isTracking: boolean;
  isFetchingDrivers: boolean;
  driverCount: number;
  locationAccuracy: number | null;
  lastUpdatedAt: number | null;
}

export const MapDebugOverlay = memo(function MapDebugOverlay({
  isMapReady,
  isTracking,
  isFetchingDrivers,
  driverCount,
  locationAccuracy,
  lastUpdatedAt,
}: MapDebugOverlayProps) {
  if (!__DEV__) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      className="absolute left-4 top-24 rounded-xl bg-primary/90 px-3 py-3"
    >
      <Typography variant="caption" className="font-semibold text-accent">
        RIDEVO MAP DEBUG
      </Typography>

      <View className="mt-2 gap-1">
        <Typography variant="caption" className="text-white">
          Map: {isMapReady ? "Ready" : "Loading"}
        </Typography>

        <Typography variant="caption" className="text-white">
          GPS: {isTracking ? "Active" : "Inactive"}
        </Typography>

        <Typography variant="caption" className="text-white">
          Accuracy:{" "}
          {locationAccuracy !== null
            ? `${locationAccuracy.toFixed(1)} m`
            : "Unknown"}
        </Typography>

        <Typography variant="caption" className="text-white">
          Drivers: {driverCount}
        </Typography>

        <Typography variant="caption" className="text-white">
          Query: {isFetchingDrivers ? "Fetching" : "Idle"}
        </Typography>

        <Typography variant="caption" className="text-white">
          Updated:{" "}
          {lastUpdatedAt
            ? new Date(lastUpdatedAt).toLocaleTimeString()
            : "Never"}
        </Typography>
      </View>
    </View>
  );
});
