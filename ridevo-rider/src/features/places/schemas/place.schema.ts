import { z } from "zod";

export const savedPlaceTypeSchema = z.enum(["home", "work"]);

export const placeCoordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),

  longitude: z.number().finite().min(-180).max(180),
});

export const placeSchema = z.object({
  id: z.string().trim().min(1),

  name: z.string().trim().min(1).max(200),

  address: z.string().trim().min(1).max(500),

  coordinates: placeCoordinatesSchema,

  provider: z.enum(["mapbox", "manual"]),
});

export const savedPlaceSchema = placeSchema.extend({
  type: savedPlaceTypeSchema,

  createdAt: z.number().finite().nonnegative(),

  updatedAt: z.number().finite().nonnegative(),
});

export const savedPlacesSchema = z.object({
  home: savedPlaceSchema
    .extend({
      type: z.literal("home"),
    })
    .nullable(),

  work: savedPlaceSchema
    .extend({
      type: z.literal("work"),
    })
    .nullable(),
});

export const savePlaceInputSchema = z.object({
  type: savedPlaceTypeSchema,

  place: placeSchema,
});

export const recentDestinationSchema = placeSchema.extend({
  lastSelectedAt: z.number().int().nonnegative(),

  selectionCount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
});

export const recentDestinationsSchema = z.array(recentDestinationSchema);

export const recentDestinationsByUserSchema = z.record(
  z.string(),
  recentDestinationsSchema,
);
