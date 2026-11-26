import type { DriverCoordinates } from "../types/driver.types";

const EARTH_RADIUS_METERS = 6_371_008.8;

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

export function normalizeHeading(heading: number): number {
  return ((heading % 360) + 360) % 360;
}

export function normalizeLongitude(longitude: number): number {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

export function calculateDestination(
  origin: DriverCoordinates,
  distance: number,
  heading: number,
): DriverCoordinates {
  const angularDistance = distance / EARTH_RADIUS_METERS;

  const bearing = degreesToRadians(heading);

  const latitude = degreesToRadians(origin.latitude);

  const longitude = degreesToRadians(origin.longitude);

  const destinationLatitude = Math.asin(
    Math.sin(latitude) * Math.cos(angularDistance) +
      Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing),
  );

  const destinationLongitude =
    longitude +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude),

      Math.cos(angularDistance) -
        Math.sin(latitude) * Math.sin(destinationLatitude),
    );

  return {
    latitude: radiansToDegrees(destinationLatitude),

    longitude: normalizeLongitude(radiansToDegrees(destinationLongitude)),
  };
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
