import { memo } from "react";
import { View } from "react-native";

import Svg, { Circle, G, Path } from "react-native-svg";

import { Navigation } from "lucide-react-native";
import Animated from "react-native-reanimated";

import { Typography } from "@/components/ui/Typography";

import { CityMap, MAP_SIZE, ROUTE_PATH } from "./CityMap";

import { RidevoCar } from "./RidevoCar";
import { useWelcomeMotion } from "./useWelcomeMotion";

const AnimatedGroup = Animated.createAnimatedComponent(G);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WelcomeAnimationProps {
  active?: boolean;
}

export const WelcomeAnimation = memo(function WelcomeAnimation({
  active = true,
}: WelcomeAnimationProps) {
  const { carProps, pinProps, pulseProps, routeProps } =
    useWelcomeMotion(active);

  return (
    <View
      accessible
      accessibilityLabel="An illustrated Ridevo vehicle travelling towards its destination"
      className="relative w-full overflow-hidden rounded-[28px] border border-[#E8ECE5] bg-[#F3F5F0]"
      style={{ aspectRatio: 1 }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}>
        <CityMap />

        {/* Animated route markings */}
        <AnimatedPath
          d={ROUTE_PATH}
          fill="none"
          stroke="#C8F560"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="12 10"
          animatedProps={routeProps}
        />

        {/* Destination pulse */}
        <AnimatedCircle
          cx={277}
          cy={88}
          fill="#C8F560"
          animatedProps={pulseProps}
        />

        {/* Destination ground shadow */}
        <Circle cx={277} cy={88} r={6} fill="#101820" opacity={0.15} />

        {/* Floating destination pin */}
        <AnimatedGroup animatedProps={pinProps}>
          <Path
            d="
                M0 0
                C-6 -8 -18 -18 -18 -29
                A18 18 0 0 1 18 -29
                C18 -18 6 -8 0 0
                Z
              "
            fill="#101820"
          />

          <Circle cx={0} cy={-29} r={7} fill="#C8F560" />

          <Circle cx={0} cy={-29} r={2.5} fill="#101820" />
        </AnimatedGroup>

        {/* Moving vehicle */}
        <AnimatedGroup animatedProps={carProps}>
          <RidevoCar />
        </AnimatedGroup>
      </Svg>

      {/* Floating information card */}
      <View
        pointerEvents="none"
        className="absolute bottom-3.5 left-3.5 right-3.5 flex-row items-center rounded-2xl border border-[#E8ECE5] bg-white p-3"
        style={{
          shadowColor: "#101820",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EDF5DC]">
          <Navigation size={21} color="#101820" strokeWidth={1.8} />
        </View>

        <View className="ml-3 flex-1">
          <Typography variant="small" className="font-semibold">
            Your next stop
          </Typography>

          <Typography variant="caption" className="mt-0.5 text-muted">
            Anywhere life takes you.
          </Typography>
        </View>

        <View className="ml-2 h-2 w-2 rounded-full bg-[#83B936]" />
      </View>
    </View>
  );
});
