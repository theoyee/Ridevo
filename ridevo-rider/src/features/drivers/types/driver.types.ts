export type VehicleCategory = "economy" | "comfort" | "premium";

export type DriverAvailability = "available" | "busy" | "offline";

export interface DriverCoordinates {
  latitude: number;
  longitude: number;
}

export interface NearbyDriver {
  id: string;

  coordinates: DriverCoordinates;

  heading: number;

  speed: number;

  category: VehicleCategory;

  availability: DriverAvailability;

  updatedAt: number;
}

export interface NearbyDriversRequest {
  latitude: number;
  longitude: number;

  // Search radius in meters.
  radius: number;

  limit?: number;
}

export interface NearbyDriversResponse {
  drivers: NearbyDriver[];

  timestamp: number;
}

export interface DriverService {
  getNearbyDrivers(
    request: NearbyDriversRequest,
  ): Promise<NearbyDriversResponse>;
}
