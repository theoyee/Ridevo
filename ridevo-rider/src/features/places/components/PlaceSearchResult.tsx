import { memo } from "react";

import { Pressable, View } from "react-native";

import { ArrowUpRight, MapPin } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import type { Place } from "../types/place.types";

interface PlaceSearchResultProps {
  place: Place;

  onPress: (place: Place) => void;

  disabled?: boolean;
}

export const PlaceSearchResult = memo(function PlaceSearchResult({
  place,
  onPress,
  disabled = false,
}: PlaceSearchResultProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${place.name}, ${place.address}`}
      accessibilityHint="Select this address"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => onPress(place)}
      className="min-h-[76px] flex-row items-center gap-3 py-3 active:opacity-60"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
        <MapPin size={22} color="#101820" strokeWidth={1.8} />
      </View>

      <View className="min-w-0 flex-1">
        <Typography variant="bodyMedium" numberOfLines={2}>
          {place.name}
        </Typography>

        <Typography
          variant="small"
          className="mt-1 text-muted"
          numberOfLines={2}
        >
          {place.address}
        </Typography>
      </View>

      <ArrowUpRight size={19} color="#667085" strokeWidth={1.8} />
    </Pressable>
  );
});
