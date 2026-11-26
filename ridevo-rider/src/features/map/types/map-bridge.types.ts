import type { MapCoordinates } from "./map.types";

export interface MapCameraOptions {
  centerCoordinate: MapCoordinates;
  zoomLevel?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

export interface MapVehicle {
  id: string;
  coordinates: MapCoordinates;
  heading: number;
}

export type MapCommand =
  | {
      type: "SET_CAMERA";
      payload: MapCameraOptions;
    }
  | {
      type: "SET_USER_LOCATION";
      payload: {
        coordinates: MapCoordinates;
        accuracy?: number;
      };
    }
  | {
      type: "CLEAR_USER_LOCATION";
    }
  | {
      type: "SET_NEARBY_DRIVERS";
      payload: {
        drivers: MapVehicle[];
      };
    }
  | {
      type: "CLEAR_NEARBY_DRIVERS";
    };

export type MapEvent =
  | {
      type: "MAP_READY";
    }
  | {
      type: "MAP_ERROR";
      payload: {
        message: string;
      };
    }
  | {
      type: "MAP_PRESS";
      payload: {
        coordinates: MapCoordinates;
      };
    }
  | {
      type: "CAMERA_CHANGED";
      payload: {
        coordinates: MapCoordinates;
        zoomLevel: number;
        heading: number;
        pitch: number;
      };
    }
  | {
      type: "MAP_PERFORMANCE";
      payload: {
        fps: number;
        vehicleCount: number;
      };
    };

export interface MapController {
  setCamera(options: MapCameraOptions): void;

  setUserLocation(coordinates: MapCoordinates, accuracy?: number): void;

  clearUserLocation(): void;

  setNearbyDrivers(drivers: MapVehicle[]): void;

  clearNearbyDrivers(): void;
}
