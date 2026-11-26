import { memo } from "react";

import { Pressable, View } from "react-native";

import { Typography } from "@/components/ui/Typography";

import type { RecentDestination } from "@/features/places/types/place.types";

import { RecentDestinationItem } from "./RecentDestinationItem";

interface RecentDestinationsProps {
  destinations: RecentDestination[];

  onDestinationPress: (destination: RecentDestination) => void;

  onDestinationLongPress: (destination: RecentDestination) => void;

  onClearPress: () => void;
}

export const RecentDestinations = memo(function RecentDestinations({
  destinations,
  onDestinationPress,
  onDestinationLongPress,
  onClearPress,
}: RecentDestinationsProps) {
  if (destinations.length === 0) {
    return null;
  }

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Typography variant="bodyMedium">Recent destinations</Typography>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear destination history"
          onPress={onClearPress}
          className="min-h-12 justify-center px-2 active:opacity-60"
        >
          <Typography variant="small" className="text-muted">
            Clear
          </Typography>
        </Pressable>
      </View>

      {destinations.map((destination, index) => (
        <View key={`${destination.provider}:${destination.id}`}>
          <RecentDestinationItem
            destination={destination}
            onPress={onDestinationPress}
            onLongPress={onDestinationLongPress}
          />

          {index < destinations.length - 1 && (
            <View className="ml-14 h-px bg-border" />
          )}
        </View>
      ))}
    </View>
  );
});
