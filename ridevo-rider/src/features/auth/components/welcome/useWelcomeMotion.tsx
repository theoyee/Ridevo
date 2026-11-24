import { useEffect } from "react";

import {
  cancelAnimation,
  Easing,
  interpolate,
  ReduceMotion,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const DURATION = 9000;

// Sampled points along the map's rounded route.
const PROGRESS = [0, 0.18, 0.2, 0.22, 0.43, 0.45, 0.47, 0.72, 0.74, 0.76, 1];

const ROUTE_X = [84, 84, 87, 95, 174, 182, 185, 185, 188, 196, 277];

const ROUTE_Y = [283, 215, 207, 204, 204, 201, 193, 98, 91, 88, 88];

const ROUTE_ROTATION = [0, 0, 45, 90, 90, 45, 0, 0, 45, 90, 90];

export function useWelcomeMotion(active = true) {
  const reducedMotion = useReducedMotion();

  const progress = useSharedValue(0);
  const ambient = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion || !active) {
      progress.value = 0.45;
      ambient.value = 0;

      return;
    }

    progress.value = 0;
    ambient.value = 0;

    progress.value = withRepeat(
      withTiming(1, {
        duration: DURATION,
        easing: Easing.linear,
      }),
      -1,
      false,
      undefined,
      ReduceMotion.System,
    );

    ambient.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false,
      undefined,
      ReduceMotion.System,
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(ambient);
    };
  }, [active, reducedMotion, progress, ambient]);

  // const carProps = useAnimatedProps(() => {
  //   const travel = interpolate(
  //     progress.value,
  //     [0, 0.06, 0.86, 1],
  //     [0, 0, 1, 1],
  //   );

  //   const x = interpolate(travel, PROGRESS, ROUTE_X);
  //   const y = interpolate(travel, PROGRESS, ROUTE_Y);

  //   const rotation = interpolate(travel, PROGRESS, ROUTE_ROTATION);

  //   const opacity = interpolate(
  //     progress.value,
  //     [0, 0.04, 0.9, 1],
  //     [0, 1, 1, 0],
  //   );

  //   return {
  //     transform: `translate(${x}, ${y}) rotate(${rotation})`,
  //     opacity,
  //   };
  // });

  const carProps = useAnimatedProps(() => {
    const travel = interpolate(
      progress.value,
      [0, 0.06, 0.86, 1],
      [0, 0, 1, 1],
    );

    const x = interpolate(travel, PROGRESS, ROUTE_X);
    const y = interpolate(travel, PROGRESS, ROUTE_Y);

    const rotation = interpolate(travel, PROGRESS, ROUTE_ROTATION);

    const opacity = interpolate(
      progress.value,
      [0, 0.04, 0.9, 1],
      [0, 1, 1, 0],
    );

    return {
      x,
      y,
      rotation,
      opacity,
    };
  });

  const pinProps = useAnimatedProps(() => {
    const offset = Math.sin(ambient.value * Math.PI * 2) * 3;

    return {
      transform: `translate(277, ${88 + offset})`,
    };
  });

  const pulseProps = useAnimatedProps(() => ({
    r: interpolate(ambient.value, [0, 1], [12, 28]),
    opacity: interpolate(ambient.value, [0, 1], [0.35, 0]),
  }));

  const routeProps = useAnimatedProps(() => ({
    strokeDashoffset: -44 * ambient.value,
  }));

  return {
    carProps,
    pinProps,
    pulseProps,
    routeProps,
  };
}
