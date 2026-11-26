import { mockDriverSimulator } from "./mock-ride.service";

import type { Ride, StartRideInput } from "../types/ride.types";

function requireDevelopmentMode(): void {
  if (!__DEV__) {
    throw new Error("Driver simulation is unavailable.");
  }
}

export const driverSimulatorService = {
  async startRide(input: StartRideInput): Promise<Ride> {
    requireDevelopmentMode();

    return mockDriverSimulator.startRide(input);
  },

  async completeRide(rideId: string): Promise<Ride> {
    requireDevelopmentMode();

    return mockDriverSimulator.completeRide(rideId);
  },

  async confirmCashPayment(rideId: string): Promise<Ride> {
    requireDevelopmentMode();

    return mockDriverSimulator.confirmCashPayment(rideId);
  },
};
