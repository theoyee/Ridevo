import type { Place, PlaceCoordinates } from "../types/place.types";

import { SEARCH_CONFIG } from "../constants/search.constants";

import {
  geocodingFeatureSchema,
  geocodingResponseSchema,
} from "../schemas/search.schema";

export interface PlaceSearchRequest {
  query: string;
  proximity?: PlaceCoordinates;
  signal?: AbortSignal;
  permanent?: boolean;
}

export class PlaceSearchError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);

    this.name = "PlaceSearchError";
  }
}

function getAccessToken(): string {
  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token?.startsWith("pk.")) {
    throw new PlaceSearchError("Mapbox search is not configured.");
  }

  return token;
}

async function searchPlaces({
  query,
  proximity,
  signal,
  permanent = false,
}: PlaceSearchRequest): Promise<Place[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < SEARCH_CONFIG.minimumQueryLength) {
    return [];
  }

  if (normalizedQuery.length > SEARCH_CONFIG.maximumQueryLength) {
    throw new PlaceSearchError("Search query is too long.");
  }

  if (permanent && !SEARCH_CONFIG.permanentGeocoding) {
    throw new PlaceSearchError("Permanent address storage is not enabled.");
  }

  const params = new URLSearchParams({
    q: normalizedQuery,

    access_token: getAccessToken(),

    country: SEARCH_CONFIG.country,

    language: SEARCH_CONFIG.language,

    limit: String(SEARCH_CONFIG.resultLimit),

    autocomplete: "true",

    permanent: String(permanent),
  });

  if (proximity) {
    params.set("proximity", `${proximity.longitude},${proximity.latitude}`);
  }

  const controller = new AbortController();

  let timedOut = false;

  const abort = () => controller.abort();

  if (signal?.aborted) {
    controller.abort();
  }

  signal?.addEventListener("abort", abort);

  const timeout = setTimeout(() => {
    timedOut = true;

    controller.abort();
  }, SEARCH_CONFIG.timeoutMs);

  try {
    const response = await fetch(
      `${SEARCH_CONFIG.endpoint}/forward?${params}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (response.status === 429) {
      throw new PlaceSearchError(
        "Too many searches. Please try again shortly.",
        429,
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new PlaceSearchError(
        "Address search is currently unavailable.",
        response.status,
      );
    }

    if (!response.ok) {
      throw new PlaceSearchError(
        "Unable to search addresses.",
        response.status,
      );
    }

    const payload: unknown = await response.json();

    const result = geocodingResponseSchema.safeParse(payload);

    if (!result.success) {
      throw new PlaceSearchError("Invalid address search response.");
    }

    const places: Place[] = [];

    const seen = new Set<string>();

    for (const rawFeature of result.data.features) {
      const parsed = geocodingFeatureSchema.safeParse(rawFeature);

      if (!parsed.success) {
        continue;
      }

      const feature = parsed.data;

      const properties = feature.properties;

      const id = properties.mapbox_id ?? feature.id;

      if (seen.has(id)) {
        continue;
      }

      seen.add(id);

      const [longitude, latitude] = feature.geometry.coordinates;

      places.push({
        id,

        name: properties.name,

        address:
          properties.full_address ??
          [properties.name, properties.place_formatted]
            .filter(Boolean)
            .join(", "),

        coordinates: {
          latitude,
          longitude,
        },

        provider: "mapbox",
      });
    }

    return places;
  } catch (cause) {
    if (timedOut) {
      throw new PlaceSearchError("Address search timed out. Please try again.");
    }

    if (signal?.aborted || cause instanceof PlaceSearchError) {
      throw cause;
    }

    throw new PlaceSearchError(
      "Unable to connect. Check your internet connection.",
    );
  } finally {
    clearTimeout(timeout);

    signal?.removeEventListener("abort", abort);
  }
}

export const geocodingService = {
  searchPlaces,
};
