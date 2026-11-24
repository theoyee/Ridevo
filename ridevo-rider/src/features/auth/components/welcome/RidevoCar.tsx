import { memo } from "react";

import {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

export const RidevoCar = memo(function RidevoCar() {
  return (
    <G>
      <Defs>
        <LinearGradient id="ridevoCarBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E4FFA8" />
          <Stop offset="50%" stopColor="#C8F560" />
          <Stop offset="100%" stopColor="#A4CE40" />
        </LinearGradient>

        <LinearGradient id="ridevoCarGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#40525B" />
          <Stop offset="100%" stopColor="#101820" />
        </LinearGradient>
      </Defs>

      {/* Soft layered shadow */}
      <Ellipse cx={2} cy={4} rx={18} ry={24} fill="#101820" opacity={0.06} />

      <Ellipse cx={1} cy={3} rx={15} ry={21} fill="#101820" opacity={0.1} />

      {/* Wheels */}
      <G fill="#101820">
        <Rect x={-15} y={-15} width={5} height={11} rx={2} />
        <Rect x={10} y={-15} width={5} height={11} rx={2} />
        <Rect x={-15} y={9} width={5} height={11} rx={2} />
        <Rect x={10} y={9} width={5} height={11} rx={2} />
      </G>

      {/* Side mirrors */}
      <Rect x={-18} y={-8} width={7} height={4} rx={2} fill="#B0DA4D" />

      <Rect x={11} y={-8} width={7} height={4} rx={2} fill="#B0DA4D" />

      {/* Vehicle body */}
      <Rect
        x={-14}
        y={-23}
        width={28}
        height={46}
        rx={10}
        fill="url(#ridevoCarBody)"
        stroke="#A3CB42"
        strokeWidth={0.8}
      />

      {/* Front windshield */}
      <Path
        d="M-10 -13 Q0 -17 10 -13 L9 -5 H-9 Z"
        fill="url(#ridevoCarGlass)"
      />

      {/* Roof */}
      <Rect x={-8} y={-3} width={16} height={12} rx={3} fill="#D8FA8D" />

      {/* Rear windshield */}
      <Path d="M-9 11 H9 L10 16 Q0 19 -10 16 Z" fill="url(#ridevoCarGlass)" />

      {/* Side windows */}
      <Rect x={-12} y={-3} width={2} height={12} rx={1} fill="#26373E" />

      <Rect x={10} y={-3} width={2} height={12} rx={1} fill="#26373E" />

      {/* Headlights */}
      <Rect x={-10} y={-21} width={7} height={3} rx={1.5} fill="#FFFFFF" />

      <Rect x={3} y={-21} width={7} height={3} rx={1.5} fill="#FFFFFF" />

      {/* Tail lights */}
      <Rect x={-10} y={19} width={6} height={2.5} rx={1} fill="#C65C46" />

      <Rect x={4} y={19} width={6} height={2.5} rx={1} fill="#C65C46" />
    </G>
  );
});
