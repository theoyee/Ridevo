export const SEARCH_CONFIG = {
  endpoint: "https://api.mapbox.com/search/geocode/v6",

  minimumQueryLength: 3,
  maximumQueryLength: 200,

  debounceMs: 350,
  timeoutMs: 10_000,

  resultLimit: 8,

  country: "ng",
  language: "en",

  permanentGeocoding:
    process.env.EXPO_PUBLIC_MAPBOX_PERMANENT_GEOCODING === "true",
} as const;
