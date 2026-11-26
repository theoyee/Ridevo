import { memo } from "react";

import { Pressable, View } from "react-native";

import { ChevronRight, History } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import type { RecentDestination } from "@/features/places/types/place.types";

interface RecentDestinationItemProps {
  destination: RecentDestination;

  onPress: (destination: RecentDestination) => void;

  onLongPress?: (destination: RecentDestination) => void;
}

export const RecentDestinationItem = memo(function RecentDestinationItem({
  destination,
  onPress,
  onLongPress,
}: RecentDestinationItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${destination.name}, ${destination.address}`}
      accessibilityHint="Select this destination"
      onPress={() => onPress(destination)}
      onLongPress={onLongPress ? () => onLongPress(destination) : undefined}
      className="min-h-[72px] flex-row items-center py-3 active:opacity-60"
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-surface">
        <History size={21} color="#101820" strokeWidth={1.8} />
      </View>

      <View className="ml-3 min-w-0 flex-1">
        <Typography variant="bodyMedium" numberOfLines={1}>
          {destination.name}
        </Typography>

        <Typography
          variant="caption"
          numberOfLines={1}
          className="mt-1 text-muted"
        >
          {destination.address}
        </Typography>
      </View>

      <ChevronRight size={19} color="#98A2B3" strokeWidth={1.8} />
    </Pressable>
  );
});
