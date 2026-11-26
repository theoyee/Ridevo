export type MapCoordinates = [longitude: number, latitude: number];

export type MapStatus = "idle" | "loading" | "ready" | "error";

export interface MapCameraPosition {
  centerCoordinate: MapCoordinates;
  zoomLevel: number;
  heading: number;
  pitch: number;
}

export interface MapConfiguration {
  accessToken: string;
  styleURL: string;
  defaultCamera: MapCameraPosition;
}
