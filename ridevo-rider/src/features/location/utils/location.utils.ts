import type {
  Coordinates,
  LocationAccuracy,
  UserLocation,
} from "../types/location.types";

export function isValidCoordinates(coordinates: Coordinates): boolean {
  const { latitude, longitude } = coordinates;

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function classifyAccuracy(accuracy: number | null): LocationAccuracy {
  if (accuracy === null || !Number.isFinite(accuracy) || accuracy < 0) {
    return "unknown";
  }

  if (accuracy <= 10) return "excellent";
  if (accuracy <= 25) return "good";
  if (accuracy <= 50) return "acceptable";
  if (accuracy <= 100) return "poor";

  return "unreliable";
}

export function isLocationFresh(
  location: UserLocation,
  maxAgeMs = 30_000,
): boolean {
  const age = Date.now() - location.timestamp;

  return age >= 0 && age <= maxAgeMs;
}

export function isSuitableForPickup(location: UserLocation): boolean {
  return (
    isValidCoordinates(location) &&
    isLocationFresh(location) &&
    location.accuracy !== null &&
    Number.isFinite(location.accuracy) &&
    location.accuracy >= 0 &&
    location.accuracy <= 50
  );
}

export function toMapboxCoordinates(
  coordinates: Coordinates,
): [number, number] {
  return [coordinates.longitude, coordinates.latitude];
}

export function distanceInMeters(from: Coordinates, to: Coordinates): number {
  const earthRadius = 6_371_000;

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const latitudeDifference = toRadians(to.latitude - from.latitude);

  const longitudeDifference = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const clamped = Math.min(1, Math.max(0, a));

  return (
    2 * earthRadius * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped))
  );
}
