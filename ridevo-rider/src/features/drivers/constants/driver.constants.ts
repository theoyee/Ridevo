export const NEARBY_DRIVER_CONFIG = {
  radiusMeters: 600,

  maxDrivers: 10,

  pollingIntervalMs: 3000,

  staleTimeMs: 2000,

  maxSnapshotAgeMs: 10000,

  maxLocationAgeMs: 120000,

  locationChangeThresholdMeters: 100,

  garbageCollectionTimeMs: 60000,
} as const;
