import { useEffect, useRef } from "react";

import { Animated, Easing, View } from "react-native";

import { useReducedMotion } from "react-native-reanimated";

import { MapPin } from "lucide-react-native";

export function DriverMatchingRadar() {
  const reduceMotion = useReducedMotion();

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,

        duration: 2400,

        easing: Easing.out(Easing.cubic),

        useNativeDriver: true,

        isInteraction: false,
      }),
    );

    animation.start();

    return () => {
      animation.stop();

      progress.setValue(0);
    };
  }, [progress, reduceMotion]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 1],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <View accessible={false} className="h-60 w-60 items-center justify-center">
      <View className="absolute h-60 w-60 rounded-full border border-[#DCE9C6] bg-[#F8FBEF]" />

      <View className="absolute h-44 w-44 rounded-full border border-[#DCE9C6]" />

      <View className="absolute h-28 w-28 rounded-full border border-[#DCE9C6]" />

      {!reduceMotion && (
        <Animated.View
          className="absolute h-60 w-60 rounded-full bg-accent"
          style={{
            opacity,

            transform: [{ scale }],
          }}
        />
      )}

      <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
        <MapPin size={28} color="#C8F560" strokeWidth={2} />
      </View>
    </View>
  );
}
