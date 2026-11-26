import { z } from "zod";

const routeCoordinateSchema = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
]);

export const directionsResponseSchema = z.object({
  code: z.string(),

  routes: z
    .array(
      z.object({
        distance: z.number().finite().nonnegative(),

        duration: z.number().finite().nonnegative(),

        geometry: z.object({
          type: z.literal("LineString"),

          coordinates: z.array(routeCoordinateSchema).min(2),
        }),
      }),
    )
    .optional(),
});
