import type {
  RideRoute,
  VehicleCategory,
  VehicleOption,
} from "../types/booking.types";

interface PricingConfig {
  name: string;
  description: string;
  capacity: number;
  baseFareMinor: number;
  perKilometerMinor: number;
  perMinuteMinor: number;
  minimumFareMinor: number;
}

const PRICING: Record<VehicleCategory, PricingConfig> = {
  economy: {
    name: "Economy",
    description: "Affordable everyday rides",
    capacity: 4,
    baseFareMinor: 50_000,
    perKilometerMinor: 22_000,
    perMinuteMinor: 3_500,
    minimumFareMinor: 150_000,
  },

  comfort: {
    name: "Comfort",
    description: "More space and comfort",
    capacity: 4,
    baseFareMinor: 75_000,
    perKilometerMinor: 30_000,
    perMinuteMinor: 4_500,
    minimumFareMinor: 200_000,
  },

  premium: {
    name: "Premium",
    description: "A premium ride experience",
    capacity: 4,
    baseFareMinor: 120_000,
    perKilometerMinor: 40_000,
    perMinuteMinor: 6_000,
    minimumFareMinor: 300_000,
  },
};

export function calculateVehicleOptions(route: RideRoute): VehicleOption[] {
  if (
    !Number.isFinite(route.distanceMeters) ||
    !Number.isFinite(route.durationSeconds) ||
    route.distanceMeters < 0 ||
    route.durationSeconds < 0
  ) {
    throw new Error("Invalid route metrics.");
  }

  const kilometers = route.distanceMeters / 1_000;

  const minutes = route.durationSeconds / 60;

  const categories: VehicleCategory[] = ["economy", "comfort", "premium"];

  return categories.map((category) => {
    const config = PRICING[category];

    const calculatedFare =
      config.baseFareMinor +
      kilometers * config.perKilometerMinor +
      minutes * config.perMinuteMinor;

    const estimatedFareMinor = Math.max(
      config.minimumFareMinor,
      Math.ceil(calculatedFare / 5_000) * 5_000,
    );

    return {
      category,
      name: config.name,
      description: config.description,
      capacity: config.capacity,
      estimatedFareMinor,
      currency: "NGN",
    };
  });
}

export function formatFare(amountMinor: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}
