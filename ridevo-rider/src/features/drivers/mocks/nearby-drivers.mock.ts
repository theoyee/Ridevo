import type {
  DriverCoordinates,
  NearbyDriver,
  VehicleCategory,
} from "../types/driver.types";

import { calculateDestination, randomBetween } from "../utils/driver.utils";

const VEHICLE_CATEGORIES: VehicleCategory[] = [
  "economy",
  "economy",
  "economy",
  "comfort",
  "premium",
];

interface GenerateDriversOptions {
  center: DriverCoordinates;
  radius: number;
  count?: number;
}

export function generateNearbyDrivers({
  center,
  radius,
  count = 10,
}: GenerateDriversOptions): NearbyDriver[] {
  const timestamp = Date.now();

  return Array.from({ length: count }, (_, index) => {
    const bearing = randomBetween(0, 360);

    const distance = Math.sqrt(Math.random()) * radius;

    const coordinates = calculateDestination(center, distance, bearing);

    const category = VEHICLE_CATEGORIES[index % VEHICLE_CATEGORIES.length];

    return {
      id: `mock-driver-${index + 1}`,

      coordinates,

      heading: randomBetween(0, 360),

      speed: randomBetween(3, 12),

      category,

      availability: "available",

      updatedAt: timestamp,
    };
  });
}
