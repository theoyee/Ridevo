import { memo, useEffect } from "react";
import { View } from "react-native";

import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BLOCK_COLUMNS = [12, 96, 180, 264];
const BLOCK_ROWS = [10, 86, 162];

interface LocationIllustrationProps {
  active?: boolean;
}

export const LocationIllustration = memo(function LocationIllustration({
  active = true,
}: LocationIllustrationProps) {
  const progress = useSharedValue(0);

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active || reducedMotion) {
      cancelAnimation(progress);
      progress.value = 0.4;
      return;
    }

    progress.value = 0;

    progress.value = withRepeat(
      withTiming(1, {
        duration: 2400,
        easing: Easing.out(Easing.cubic),
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [active, reducedMotion, progress]);

  const pulseProps = useAnimatedProps(() => ({
    r: interpolate(progress.value, [0, 1], [25, 80]),

    opacity: interpolate(progress.value, [0, 1], [0.45, 0]),
  }));

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="w-full overflow-hidden rounded-[28px] border border-border bg-[#F3F5F0]"
      style={{ aspectRatio: 340 / 240 }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 340 240">
        <Rect width={340} height={240} fill="#F3F5F0" />

        {BLOCK_COLUMNS.map((x) =>
          BLOCK_ROWS.map((y) => (
            <G key={`${x}-${y}`}>
              <Rect x={x} y={y} width={65} height={58} rx={7} fill="#E4E9E0" />

              <Rect
                x={x + 8}
                y={y + 8}
                width={20}
                height={18}
                rx={3}
                fill="#D2DACF"
              />

              <Rect
                x={x + 35}
                y={y + 8}
                width={21}
                height={39}
                rx={3}
                fill="#D7DFD4"
              />

              <Rect
                x={x + 8}
                y={y + 34}
                width={20}
                height={15}
                rx={3}
                fill="#D2DACF"
              />
            </G>
          )),
        )}

        {/* City roads */}
        <Path
          d="M0 76H340 M0 152H340 M86 0V240 M170 0V240 M254 0V240"
          stroke="#FFFFFF"
          strokeWidth={12}
          fill="none"
        />

        <Path d="M0 240L340 0" stroke="#FFFFFF" strokeWidth={16} />

        {/* Location uncertainty */}
        <Circle
          cx={170}
          cy={120}
          r={49}
          fill="#C8F560"
          opacity={0.25}
          stroke="#91BC35"
          strokeDasharray="4 5"
        />

        <AnimatedCircle
          cx={170}
          cy={120}
          fill="#C8F560"
          animatedProps={pulseProps}
        />

        <Circle cx={170} cy={120} r={25} fill="#C8F560" opacity={0.7} />

        {/* Marker shadow */}
        <Ellipse
          cx={170}
          cy={120}
          rx={17}
          ry={6}
          fill="#101820"
          opacity={0.15}
        />

        {/* Location marker */}
        <Path
          d="M170 120C158 106 145 94 145 79A25 25 0 0 1 195 79C195 94 182 106 170 120Z"
          fill="#101820"
        />

        <Circle cx={170} cy={79} r={11} fill="#C8F560" />

        {/* Floating location label */}
        <Rect
          x={105}
          y={177}
          width={130}
          height={38}
          rx={19}
          fill="#FFFFFF"
          stroke="#E4E7EC"
        />

        <Circle cx={124} cy={196} r={4} fill="#15803D" />

        <SvgText x={137} y={200} fontSize={12} fontWeight="500" fill="#101820">
          Your location
        </SvgText>
      </Svg>
    </View>
  );
});
