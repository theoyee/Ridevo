export const VEHICLE_ANIMATION_CONFIG = {
  durationMs: 2800,
  maxVisibleVehicles: 30,
  positionEpsilon: 0.0000001,
  headingEpsilon: 0.1,
} as const;

export const INTERPOLATION_SCRIPT = `
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(start, end, progress) {
    return start + (end - start) * progress;
  }

  function normalizeVehicleHeading(heading) {
    if (!Number.isFinite(heading)) {
      return 0;
    }

    return ((heading % 360) + 360) % 360;
  }

  function normalizeLongitude(longitude) {
    return ((longitude + 180) % 360 + 360) % 360 - 180;
  }

  function shortestAngularDistance(start, end) {
    const from = normalizeVehicleHeading(start);
    const to = normalizeVehicleHeading(end);

    return ((to - from + 540) % 360) - 180;
  }

  function interpolateHeading(start, end, progress) {
    const distance = shortestAngularDistance(
      start,
      end
    );

    return normalizeVehicleHeading(
      start + distance * progress
    );
  }

  function interpolateCoordinates(start, end, progress) {
    const longitudeDelta = shortestAngularDistance(
      start[0],
      end[0]
    );

    return [
      normalizeLongitude(
        start[0] + longitudeDelta * progress
      ),
      lerp(start[1], end[1], progress)
    ];
  }

  function coordinatesAreEqual(first, second, epsilon) {
    return (
      Math.abs(
        shortestAngularDistance(first[0], second[0])
      ) <= epsilon &&
      Math.abs(first[1] - second[1]) <= epsilon
    );
  }

  function headingsAreEqual(first, second, epsilon) {
    return (
      Math.abs(
        shortestAngularDistance(first, second)
      ) <= epsilon
    );
  }
`;
