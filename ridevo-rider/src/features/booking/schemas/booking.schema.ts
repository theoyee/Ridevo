import { z } from "zod";

import {
  placeCoordinatesSchema,
  placeSchema,
} from "@/features/places/schemas/place.schema";

export const pickupSourceSchema = z.enum(["gps", "search", "map"]);

export const destinationSourceSchema = z.enum([
  "search",
  "saved_place",
  "recent_destination",
  "map",
]);

export const destinationSearchModeSchema = z.enum([
  "destination",
  "pickup",
  "save-home",
  "save-work",
]);

export const bookingPickupSchema = z.object({
  coordinates: placeCoordinatesSchema,

  name: z.string().trim().min(1).max(200).nullable(),

  address: z.string().trim().min(1).max(500).nullable(),

  source: pickupSourceSchema,

  accuracy: z.number().finite().nonnegative().nullable(),

  capturedAt: z.number().int().nonnegative(),
});

export const bookingDestinationSchema = placeSchema.extend({
  source: destinationSourceSchema,
});

export const bookingDraftSchema = z.object({
  userId: z.string().trim().min(1),

  pickup: bookingPickupSchema.nullable(),

  destination: bookingDestinationSchema.nullable(),

  createdAt: z.number().int().nonnegative(),

  updatedAt: z.number().int().nonnegative(),
});

export const startBookingInputSchema = z.object({
  userId: z.string().trim().min(1),

  pickup: bookingPickupSchema.nullable().optional(),

  destination: bookingDestinationSchema.nullable().optional(),
});
