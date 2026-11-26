import { ArrowLeft } from "lucide-react-native";
import { memo } from "react";
import { Pressable, View } from "react-native";

import { Typography } from "@/components/ui/Typography";

interface BookingHeaderProps {
  title: string;
  onBack: () => void;
}

export const BookingHeader = memo(function BookingHeader({
  title,
  onBack,
}: BookingHeaderProps) {
  return (
    <View className="flex-row items-center gap-3 bg-white px-6 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        className="h-12 w-12 items-center justify-center rounded-full bg-surface active:opacity-70"
      >
        <ArrowLeft size={24} color="#101820" strokeWidth={1.8} />
      </Pressable>

      <Typography variant="h2" className="flex-1">
        {title}
      </Typography>
    </View>
  );
});
