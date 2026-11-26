import type { CreateRideInput, RateRideInput, Ride } from "../types/ride.types";

export interface RideService {
  createRide(input: CreateRideInput): Promise<Ride>;

  getRide(rideId: string): Promise<Ride>;

  getActiveRide(): Promise<Ride | null>;

  cancelRide(rideId: string, reason?: string): Promise<Ride>;

  rateRide(input: RateRideInput): Promise<Ride>;
}
