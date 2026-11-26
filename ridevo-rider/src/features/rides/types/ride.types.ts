import type {
  BookingDestination,
  BookingPickup,
  VehicleCategory,
} from "@/features/booking/types/booking.types";

import type { PlaceCoordinates } from "@/features/places/types/place.types";

export type PaymentMethod = "cash" | "card" | "wallet";

export type RideStatus =
  | "searching"
  | "accepted"
  | "arriving"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "unmatched";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface RideDriver {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  photoUrl: string | null;
  phoneNumber: string;
}

export interface RideVehicle {
  id: string;
  category: VehicleCategory;
  manufacturer: string;
  model: string;
  color: string;
  plateNumber: string;
}

export interface RideDriverLocation {
  coordinates: PlaceCoordinates;
  heading: number;
  updatedAt: number;
}

export interface Ride {
  id: string;
  userId: string;
  status: RideStatus;
  version: number;

  rating?: RideRating | null;

  pickup: BookingPickup;
  destination: BookingDestination;

  category: VehicleCategory;

  estimatedFareMinor: number;
  finalFareMinor: number | null;
  currency: "NGN";

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  driver: RideDriver | null;
  vehicle: RideVehicle | null;
  driverLocation: RideDriverLocation | null;

  verificationPin: string | null;

  requestedAt: number;
  acceptedAt: number | null;
  arrivedAt: number | null;
  startedAt: number | null;
  completedAt: number | null;
  cancelledAt: number | null;

  updatedAt: number;
}

export interface CreateRideInput {
  idempotencyKey: string;
  pickup: BookingPickup;
  destination: BookingDestination;
  category: VehicleCategory;
  paymentMethod: PaymentMethod;
  estimatedFareMinor: number;
  currency: "NGN";
}

export interface RideRating {
  stars: number;
  comment: string | null;
  createdAt: number;
}

export interface StartRideInput {
  rideId: string;
  pin: string;
}

export interface RateRideInput {
  rideId: string;
  stars: number;
  comment?: string;
}