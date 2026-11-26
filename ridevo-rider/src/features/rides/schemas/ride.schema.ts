import { z } from "zod";

import {
  bookingDestinationSchema,
  bookingPickupSchema,
  vehicleCategorySchema,
} from "@/features/booking/schemas/booking.schema";

import { placeCoordinatesSchema } from "@/features/places/schemas/place.schema";

export const paymentMethodSchema = z.enum(["cash", "card", "wallet"]);

export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const rideStatusSchema = z.enum([
  "searching",
  "accepted",
  "arriving",
  "arrived",
  "in_progress",
  "completed",
  "cancelled",
  "unmatched",
]);

const moneySchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);

const timestampSchema = z.number().int().nonnegative();

export const rideDriverSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  rating: z.number().finite().min(0).max(5),
  photoUrl: z.string().url().nullable(),
  phoneNumber: z.string().min(1),
});

export const rideVehicleSchema = z.object({
  id: z.string().min(1),
  category: vehicleCategorySchema,
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  color: z.string().min(1),
  plateNumber: z.string().min(1),
});

export const rideDriverLocationSchema = z.object({
  coordinates: placeCoordinatesSchema,
  heading: z.number().finite().min(0).lt(360),
  updatedAt: timestampSchema,
});

export const rideRatingSchema = z.object({
  stars: z.number().int().min(1).max(5),

  comment: z.string().trim().max(500).nullable(),

  createdAt: z.number().int().nonnegative(),
});

export const startRideInputSchema = z.object({
  rideId: z.string().min(1),

  pin: z.string().regex(/^\d{4}$/),
});

export const rateRideInputSchema = z.object({
  rideId: z.string().min(1),

  stars: z.number().int().min(1).max(5),

  comment: z.string().trim().max(500).optional(),
});

export const rideSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),

  status: rideStatusSchema,
  version: z.number().int().positive(),

  rating: rideRatingSchema.nullable().optional(),

  pickup: bookingPickupSchema,
  destination: bookingDestinationSchema,

  category: vehicleCategorySchema,

  estimatedFareMinor: moneySchema,
  finalFareMinor: moneySchema.nullable(),

  currency: z.literal("NGN"),

  paymentMethod: paymentMethodSchema,
  paymentStatus: paymentStatusSchema,

  driver: rideDriverSchema.nullable(),
  vehicle: rideVehicleSchema.nullable(),
  driverLocation: rideDriverLocationSchema.nullable(),

  verificationPin: z
    .string()
    .regex(/^\d{4}$/)
    .nullable(),

  requestedAt: timestampSchema,
  acceptedAt: timestampSchema.nullable(),
  arrivedAt: timestampSchema.nullable(),
  startedAt: timestampSchema.nullable(),
  completedAt: timestampSchema.nullable(),
  cancelledAt: timestampSchema.nullable(),
  updatedAt: timestampSchema,
});

export const createRideInputSchema = z.object({
  idempotencyKey: z.string().trim().min(1).max(200),

  pickup: bookingPickupSchema,
  destination: bookingDestinationSchema,

  category: vehicleCategorySchema,

  paymentMethod: paymentMethodSchema,

  estimatedFareMinor: moneySchema,

  currency: z.literal("NGN"),
});

export const mockRideDatabaseSchema = z.object({
  version: z.literal(1),

  rides: z.record(z.string(), rideSchema),

  requests: z.record(
    z.string(),
    z.object({
      rideId: z.string(),
      fingerprint: z.string(),
    }),
  ),
});

export type MockRideDatabase = z.infer<typeof mockRideDatabaseSchema>;
