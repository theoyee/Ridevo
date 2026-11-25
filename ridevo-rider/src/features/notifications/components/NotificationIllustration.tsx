import { memo, useEffect } from "react";
import { View } from "react-native";

import { Bell, CarFront, CheckCircle2 } from "lucide-react-native";

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Typography } from "@/components/ui/Typography";

interface NotificationIllustrationProps {
  active?: boolean;
}

export const NotificationIllustration = memo(function NotificationIllustration({
  active = true,
}: NotificationIllustrationProps) {
  const offset = useSharedValue(0);

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active || reducedMotion) {
      cancelAnimation(offset);
      offset.value = 0;
      return;
    }

    offset.value = withRepeat(
      withTiming(7, {
        duration: 1600,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    return () => cancelAnimation(offset);
  }, [active, reducedMotion, offset]);

  const firstCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -offset.value }],
  }));

  const secondCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="relative h-[240px] w-full items-center justify-center overflow-hidden rounded-[28px] border border-border bg-[#F3F5F0]"
    >
      {/* Background circles */}
      <View className="absolute h-[210px] w-[210px] rounded-full bg-[#E6EDDC]" />

      <View className="absolute h-[160px] w-[160px] rounded-full bg-[#DCE8C8]" />

      {/* Phone mockup */}
      <View className="h-[210px] w-[112px] rounded-[26px] bg-primary p-[6px]">
        <View className="flex-1 items-center rounded-[21px] bg-background">
          <View className="mt-2 h-2 w-10 rounded-full bg-primary" />

          <View className="mt-8 h-12 w-12 items-center justify-center rounded-2xl bg-accent">
            <Bell size={25} color="#101820" strokeWidth={1.8} />
          </View>

          <View className="mt-4 h-2 w-16 rounded-full bg-border" />

          <View className="mt-2 h-2 w-12 rounded-full bg-border" />
        </View>
      </View>

      {/* Driver arrival notification */}
      <Animated.View
        style={firstCardStyle}
        className="absolute left-4 right-8 top-12 flex-row items-center gap-3 rounded-2xl border border-border bg-background p-3"
      >
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent">
          <CarFront size={22} color="#101820" strokeWidth={1.8} />
        </View>

        <View className="flex-1 gap-1">
          <Typography variant="small" className="font-semibold">
            Your driver is here
          </Typography>

          <Typography variant="caption" className="text-muted">
            Meet your driver at the pickup point.
          </Typography>
        </View>
      </Animated.View>

      {/* Ride confirmation notification */}
      <Animated.View
        style={secondCardStyle}
        className="absolute bottom-9 left-8 right-4 flex-row items-center gap-3 rounded-2xl border border-border bg-background p-3"
      >
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-success/10">
          <CheckCircle2 size={22} color="#15803D" strokeWidth={1.8} />
        </View>

        <View className="flex-1 gap-1">
          <Typography variant="small" className="font-semibold">
            Ride confirmed
          </Typography>

          <Typography variant="caption" className="text-muted">
            Your driver is on the way.
          </Typography>
        </View>
      </Animated.View>
    </View>
  );
});
