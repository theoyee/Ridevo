export const BOOKING_CONFIG = {
  pickup: {
    maximumLocationAgeMs: 30_000,
    maximumAccuracyMeters: 50,
  },

  routes: {
    destinationSearch: "/(booking)/destination-search",

    confirmPickup: "/(booking)/confirm-pickup",

    confirmDestination: "/(booking)/confirm-destination",

    vehicleSelection: "/(booking)/vehicle-selection",
  },
} as const;
