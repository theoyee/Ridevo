import { z } from "zod";

export const geocodingFeatureSchema = z.object({
  id: z.string(),

  geometry: z.object({
    type: z.literal("Point"),

    coordinates: z.tuple([
      z.number().finite().min(-180).max(180),
      z.number().finite().min(-90).max(90),
    ]),
  }),

  properties: z.object({
    mapbox_id: z.string().optional(),
    name: z.string().min(1),
    full_address: z.string().optional(),
    place_formatted: z.string().optional(),
    feature_type: z.string().optional(),
  }),
});

export const geocodingResponseSchema = z.object({
  type: z.literal("FeatureCollection"),

  features: z.array(z.unknown()),
});
