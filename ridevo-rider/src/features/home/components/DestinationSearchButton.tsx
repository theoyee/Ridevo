import { memo } from "react";

import { Pressable } from "react-native";

import { ArrowRight, Search } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

interface DestinationSearchButtonProps {
  onPress: () => void;

  disabled?: boolean;
}

export const DestinationSearchButton = memo(function DestinationSearchButton({
  onPress,
  disabled = false,
}: DestinationSearchButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Enter your destination"
      accessibilityHint="Opens destination search"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className="min-h-14 flex-row items-center rounded-full bg-accent px-5 active:opacity-80 disabled:opacity-50"
    >
      <Search size={23} color="#101820" strokeWidth={2} />

      <Typography variant="bodyMedium" className="ml-3 flex-1">
        Enter destination
      </Typography>

      <ArrowRight size={21} color="#101820" strokeWidth={1.8} />
    </Pressable>
  );
});
