import { memo } from "react";

import { Circle, Defs, G, Path, Pattern, Rect } from "react-native-svg";

export const MAP_SIZE = 340;

export const ROUTE_PATH =
  "M84 283 V215 Q84 204 95 204 H174 Q185 204 185 193 V98 Q185 88 196 88 H277";

const BLOCKS = [
  { x: 18, y: 22, width: 87, height: 53 },
  { x: 126, y: 22, width: 82, height: 53 },
  { x: 233, y: 22, width: 88, height: 53 },
  { x: 18, y: 101, width: 55, height: 90 },
  { x: 96, y: 101, width: 78, height: 90 },
  { x: 197, y: 101, width: 124, height: 90 },
  { x: 18, y: 216, width: 55, height: 106 },
  { x: 96, y: 216, width: 112, height: 106 },
  { x: 233, y: 216, width: 88, height: 106 },
];

const BUILDINGS = [
  [27, 31, 30, 35],
  [63, 31, 33, 35],
  [135, 31, 64, 35],
  [27, 110, 37, 72],
  [105, 110, 60, 31],
  [105, 148, 60, 34],
  [206, 110, 49, 72],
  [262, 110, 50, 72],
  [27, 225, 37, 88],
  [242, 225, 70, 39],
  [242, 271, 70, 42],
];

const TREES = [
  [252, 43],
  [274, 53],
  [298, 42],
  [121, 244],
  [153, 258],
  [182, 240],
  [126, 293],
  [180, 293],
];

export const CityMap = memo(function CityMap() {
  return (
    <G>
      <Defs>
        <Pattern
          id="mapGrid"
          width={24}
          height={24}
          patternUnits="userSpaceOnUse"
        >
          <Path d="M24 0H0V24" fill="none" stroke="#E4E9E0" strokeWidth={0.6} />
        </Pattern>
      </Defs>

      {/* Map canvas */}
      <Rect width={MAP_SIZE} height={MAP_SIZE} fill="#F3F5F0" />

      <Rect width={MAP_SIZE} height={MAP_SIZE} fill="url(#mapGrid)" />

      {/* City blocks */}
      {BLOCKS.map((block, index) => (
        <Rect key={index} {...block} rx={9} fill="#E2E7DD" />
      ))}

      {/* Green spaces */}
      <Rect x={242} y={31} width={70} height={35} rx={7} fill="#D1DFC5" />

      <Rect x={105} y={225} width={94} height={88} rx={8} fill="#D1DFC5" />

      {/* Building footprints */}
      {BUILDINGS.map(([x, y, width, height], index) => (
        <Rect
          key={index}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          fill="#FAFBF8"
          stroke="#DCE2D7"
          strokeWidth={0.6}
        />
      ))}

      {/* Trees */}
      {TREES.map(([cx, cy], index) => (
        <G key={index}>
          <Circle cx={cx + 2} cy={cy + 2} r={7} fill="#B9CCAC" />

          <Circle cx={cx} cy={cy} r={7} fill="#A8C497" />

          <Circle cx={cx - 2} cy={cy - 2} r={3} fill="#C4D8B8" />
        </G>
      ))}

      {/* Route shadow */}
      <Path
        d={ROUTE_PATH}
        fill="none"
        stroke="#101820"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.06}
      />

      {/* Route outline */}
      <Path
        d={ROUTE_PATH}
        fill="none"
        stroke="#101820"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pickup marker */}
      <Circle
        cx={84}
        cy={283}
        r={12}
        fill="#FFFFFF"
        stroke="#101820"
        strokeWidth={2}
      />

      <Circle cx={84} cy={283} r={5} fill="#101820" />
    </G>
  );
});
