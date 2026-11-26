import { mockRideService } from "./mock-ride.service";

import type { RideService } from "./ride-service.types";

function requireDevelopmentMode(): void {
  if (!__DEV__) {
    throw new Error("Production ride service is not configured.");
  }
}

export const rideService: RideService = {
  async createRide(input) {
    requireDevelopmentMode();

    return mockRideService.createRide(input);
  },

  async getRide(rideId) {
    requireDevelopmentMode();

    return mockRideService.getRide(rideId);
  },

  async getActiveRide() {
    requireDevelopmentMode();

    return mockRideService.getActiveRide();
  },

  async cancelRide(rideId, reason) {
    requireDevelopmentMode();

    return mockRideService.cancelRide(rideId, reason);
  },

  async rateRide(input) {
    requireDevelopmentMode();

    return mockRideService.rateRide(input);
  },
};
