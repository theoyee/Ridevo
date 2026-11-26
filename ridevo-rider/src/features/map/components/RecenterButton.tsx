import { LocateFixed } from "lucide-react-native";
import { ActivityIndicator, Pressable } from "react-native";

interface RecenterButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function RecenterButton({
  onPress,
  loading = false,
  disabled = false,
}: RecenterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel="Center map on my location"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      className="h-12 w-12 items-center justify-center
        rounded-full border border-border bg-white
        active:bg-surface disabled:opacity-50"
      style={{
        elevation: 3,
        shadowColor: "#101820",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#101820" />
      ) : (
        <LocateFixed size={23} color="#101820" strokeWidth={1.8} />
      )}
    </Pressable>
  );
}
