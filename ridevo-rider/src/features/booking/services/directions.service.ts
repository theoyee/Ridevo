import type { PlaceCoordinates } from "@/features/places/types/place.types";

import { placeCoordinatesSchema } from "@/features/places/schemas/place.schema";

import { directionsResponseSchema } from "../schemas/directions.schema";

import type { RideRoute } from "../types/booking.types";

interface GetRouteInput {
  pickup: PlaceCoordinates;
  destination: PlaceCoordinates;
  signal?: AbortSignal;
}

async function getRoute({
  pickup,
  destination,
  signal,
}: GetRouteInput): Promise<RideRoute> {
  const origin = placeCoordinatesSchema.parse(pickup);

  const target = placeCoordinatesSchema.parse(destination);

  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token?.startsWith("pk.")) {
    throw new Error("Mapbox is not configured.");
  }

  const coordinates = [
    `${origin.longitude},${origin.latitude}`,
    `${target.longitude},${target.latitude}`,
  ].join(";");

  const params = new URLSearchParams({
    access_token: token,
    geometries: "geojson",
    overview: "full",
    alternatives: "false",
    steps: "false",
  });

  const controller = new AbortController();

  const abort = () => controller.abort();

  if (signal?.aborted) {
    controller.abort();
  }

  signal?.addEventListener("abort", abort);

  let timedOut = false;

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 15_000);

  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?${params}`,
      {
        signal: controller.signal,
      },
    );

    if (response.status === 429) {
      throw new Error("Too many route requests. Please try again shortly.");
    }

    if (!response.ok) {
      throw new Error("Unable to calculate route.");
    }

    const payload: unknown = await response.json();

    const result = directionsResponseSchema.safeParse(payload);

    if (!result.success) {
      throw new Error("Invalid routing response.");
    }

    if (result.data.code !== "Ok") {
      throw new Error("No driving route is available between these locations.");
    }

    const route = result.data.routes?.[0];

    if (!route) {
      throw new Error("No driving route found.");
    }

    return {
      coordinates: route.geometry.coordinates,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    };
  } catch (cause) {
    if (timedOut) {
      throw new Error("Route calculation timed out.");
    }

    throw cause;
  } finally {
    clearTimeout(timeout);

    signal?.removeEventListener("abort", abort);
  }
}

export const directionsService = {
  getRoute,
};
