import { ActivityIndicator, View } from "react-native";

import { MapPinOff } from "lucide-react-native";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

interface MapLoadingOverlayProps {
  error?: string | null;
  onRetry?: () => void;
}

export function MapLoadingOverlay({ error, onRetry }: MapLoadingOverlayProps) {
  return (
    <View className="absolute inset-0 items-center justify-center bg-[#F3F5F0] px-8">
      {error ? (
        <View className="w-full max-w-[300px] items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-background">
            <MapPinOff size={28} color="#101820" />
          </View>

          <Typography variant="h3" className="text-center">
            Unable to load map
          </Typography>

          <Typography variant="small" className="text-center text-muted">
            {error}
          </Typography>

          <Button
            title="Try again"
            variant="primary"
            className="w-full"
            onPress={onRetry}
          />
        </View>
      ) : (
        <View className="items-center gap-4">
          <ActivityIndicator size="large" color="#101820" />

          <Typography variant="bodyMedium" className="text-muted">
            Loading your map...
          </Typography>
        </View>
      )}
    </View>
  );
}
