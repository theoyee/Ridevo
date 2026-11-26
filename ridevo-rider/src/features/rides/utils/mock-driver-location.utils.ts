import type { PlaceCoordinates } from "@/features/places/types/place.types";

export function getMockDriverOrigin(
  pickup: PlaceCoordinates,
): PlaceCoordinates {
  const latitude = Math.max(-90, Math.min(90, pickup.latitude + 0.004));

  const longitude = ((pickup.longitude - 0.003 + 540) % 360) - 180;

  return {
    latitude,
    longitude,
  };
}
