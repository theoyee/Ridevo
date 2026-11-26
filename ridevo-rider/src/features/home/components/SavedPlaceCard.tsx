import { memo } from "react";

import { Pressable, View } from "react-native";

import { BriefcaseBusiness, House, Plus } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import type {
  SavedPlace,
  SavedPlaceType,
} from "@/features/places/types/place.types";

interface SavedPlaceCardProps {
  type: SavedPlaceType;

  place: SavedPlace | null;

  onPress: () => void;

  onLongPress?: () => void;

  disabled?: boolean;
}

export const SavedPlaceCard = memo(function SavedPlaceCard({
  type,
  place,
  onPress,
  onLongPress,
  disabled = false,
}: SavedPlaceCardProps) {
  const isHome = type === "home";

  const title = isHome ? "Home" : "Work";

  const Icon = isHome ? House : BriefcaseBusiness;

  const description = place?.address ?? `Add ${title.toLowerCase()}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        place
          ? `${title}, ${place.address}`
          : `Add ${title.toLowerCase()} address`
      }
      accessibilityHint={
        place ? "Select this destination" : "Configure a saved place"
      }
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      className="min-h-[76px] flex-1 flex-row items-center rounded-2xl bg-surface p-3 active:opacity-70 disabled:opacity-50"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
        <Icon size={21} color="#101820" strokeWidth={1.8} />
      </View>

      <View className="ml-2 min-w-0 flex-1">
        <Typography variant="bodyMedium" numberOfLines={1}>
          {title}
        </Typography>

        <Typography
          variant="caption"
          className="mt-0.5 text-muted"
          numberOfLines={1}
        >
          {description}
        </Typography>
      </View>

      {!place && <Plus size={15} color="#667085" strokeWidth={1.8} />}
    </Pressable>
  );
});
