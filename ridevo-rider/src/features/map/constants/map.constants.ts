import type { MapCameraPosition } from "../types/map.types";

export const MAP_STYLES = {
  streets: "mapbox://styles/mapbox/streets-v12",
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  navigation: "mapbox://styles/mapbox/navigation-day-v1",
} as const;

export const DEFAULT_CAMERA: MapCameraPosition = {
  centerCoordinate: [3.3792, 6.5244],
  zoomLevel: 12,
  heading: 0,
  pitch: 0,
};

export const MAP_CONFIG = {
  minZoomLevel: 3,
  maxZoomLevel: 20,
  defaultZoomLevel: 12,
  userLocationZoomLevel: 16,
  cameraAnimationDuration: 800,
  loadingTimeoutMs: 20_000,
} as const;
