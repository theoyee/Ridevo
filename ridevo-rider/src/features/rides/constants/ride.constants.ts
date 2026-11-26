export const RIDE_CONFIG = {
  matching: {
    timeoutMs: 60_000,
    pollingIntervalMs: 3_000,
  },

  mock: {
    matchingDelayMs: 8_000,

    arrivalDelayMs: 30_000,

    tripDurationMs: 45_000,

    tripProgressIntervalMs: 1_000,
  },

  pickup: {
    arrivalRadiusMeters: 50,
  },

  verification: {
    pinLength: 4,
  },

  routes: {
    paymentSelection: "/(booking)/payment-selection",
    activeRide: "/(ride)/active",
  },
} as const;
