export type RouteCoordinate = [longitude: number, latitude: number];

export interface RoutePosition {
  coordinates: RouteCoordinate;
  heading: number;
  travelledMeters: number;
  remainingMeters: number;
}

export interface PreparedRoute {
  coordinates: RouteCoordinate[];
  cumulativeDistances: number[];
  totalDistance: number;
}

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

export function distanceBetween(
  from: RouteCoordinate,
  to: RouteCoordinate,
): number {
  const lat1 = toRadians(from[1]);
  const lat2 = toRadians(to[1]);

  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(to[0] - from[0]);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return (
    EARTH_RADIUS_METERS *
    2 *
    Math.atan2(Math.sqrt(Math.min(1, a)), Math.sqrt(Math.max(0, 1 - a)))
  );
}

export function calculateHeading(
  from: RouteCoordinate,
  to: RouteCoordinate,
): number {
  const lat1 = toRadians(from[1]);
  const lat2 = toRadians(to[1]);

  const deltaLng = toRadians(to[0] - from[0]);

  const y = Math.sin(deltaLng) * Math.cos(lat2);

  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export function prepareRoute(input: RouteCoordinate[]): PreparedRoute {
  const coordinates: RouteCoordinate[] = [];

  for (const coordinate of input) {
    const previous = coordinates[coordinates.length - 1];

    if (!previous || distanceBetween(previous, coordinate) > 0.01) {
      coordinates.push(coordinate);
    }
  }

  if (coordinates.length < 2) {
    throw new Error("A route requires at least two distinct coordinates.");
  }

  const cumulativeDistances = [0];

  let totalDistance = 0;

  for (let index = 1; index < coordinates.length; index++) {
    totalDistance += distanceBetween(
      coordinates[index - 1],
      coordinates[index],
    );

    cumulativeDistances.push(totalDistance);
  }

  return {
    coordinates,
    cumulativeDistances,
    totalDistance,
  };
}

export function getRoutePosition(
  route: PreparedRoute,
  progress: number,
): RoutePosition {
  if (!Number.isFinite(progress)) {
    throw new Error("Invalid route progress.");
  }

  const normalized = Math.max(0, Math.min(1, progress));

  const travelledMeters = route.totalDistance * normalized;

  let low = 1;

  let high = route.cumulativeDistances.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    if (route.cumulativeDistances[middle] < travelledMeters) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  const index = low;

  const start = route.coordinates[index - 1];

  const end = route.coordinates[index];

  const segmentStart = route.cumulativeDistances[index - 1];

  const segmentLength = route.cumulativeDistances[index] - segmentStart;

  const fraction =
    segmentLength > 0
      ? Math.max(
          0,
          Math.min(1, (travelledMeters - segmentStart) / segmentLength),
        )
      : 0;

  return {
    coordinates: [
      start[0] + (end[0] - start[0]) * fraction,
      start[1] + (end[1] - start[1]) * fraction,
    ],

    heading: calculateHeading(start, end),

    travelledMeters,

    remainingMeters: Math.max(0, route.totalDistance - travelledMeters),
  };
}
