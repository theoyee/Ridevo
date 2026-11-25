export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type LocationAccuracy =
  "excellent" | "good" | "acceptable" | "poor" | "unreliable" | "unknown";

export type LocationPermissionStatus =
  "undetermined" | "granted" | "denied" | "blocked";

export interface LocationPermission {
  status: LocationPermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
}

export interface UserLocation extends Coordinates {
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  source: "current" | "cached";
}

export type LocationErrorCode =
  | "PERMISSION_DENIED"
  | "PERMISSION_BLOCKED"
  | "SERVICES_DISABLED"
  | "TIMEOUT"
  | "POSITION_UNAVAILABLE";

export class LocationError extends Error {
  constructor(
    public readonly code: LocationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "LocationError";
  }
}
