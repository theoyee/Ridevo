import * as Location from "expo-location";
import { Linking } from "react-native";

import {
  LocationError,
  type LocationPermission,
  type UserLocation,
} from "../types/location.types";

import { isValidCoordinates } from "../utils/location.utils";

const LOCATION_TIMEOUT_MS = 15_000;

function mapPermission(
  permission: Location.LocationPermissionResponse,
): LocationPermission {
  return {
    granted: permission.granted,

    canAskAgain: permission.canAskAgain,

    status: permission.granted
      ? "granted"
      : permission.status === "undetermined"
        ? "undetermined"
        : permission.canAskAgain
          ? "denied"
          : "blocked",
  };
}

function mapLocation(
  location: Location.LocationObject,
  source: UserLocation["source"],
): UserLocation {
  const { coords, timestamp } = location;

  if (!isValidCoordinates(coords)) {
    throw new LocationError(
      "POSITION_UNAVAILABLE",
      "Invalid location coordinates.",
    );
  }

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    heading: coords.heading,
    speed: coords.speed,
    timestamp,
    source,
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,

      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(
            new LocationError(
              "TIMEOUT",
              "Unable to find your location. Please try again.",
            ),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
}

async function ensureLocationAvailable() {
  const permission = await Location.getForegroundPermissionsAsync();

  if (!permission.granted) {
    throw new LocationError(
      permission.canAskAgain ? "PERMISSION_DENIED" : "PERMISSION_BLOCKED",
      "Location permission is required.",
    );
  }

  const enabled = await Location.hasServicesEnabledAsync();

  if (!enabled) {
    throw new LocationError(
      "SERVICES_DISABLED",
      "Please enable location services on your device.",
    );
  }
}

export const locationService = {
  async getPermission(): Promise<LocationPermission> {
    const permission = await Location.getForegroundPermissionsAsync();

    return mapPermission(permission);
  },

  async requestPermission(): Promise<LocationPermission> {
    const current = await Location.getForegroundPermissionsAsync();

    if (current.granted || !current.canAskAgain) {
      return mapPermission(current);
    }

    const permission = await Location.requestForegroundPermissionsAsync();

    return mapPermission(permission);
  },

  async isServicesEnabled(): Promise<boolean> {
    return Location.hasServicesEnabledAsync();
  },

  async getCurrentLocation(): Promise<UserLocation> {
    await ensureLocationAvailable();

    try {
      const location = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: false,
        }),

        LOCATION_TIMEOUT_MS,
      );

      return mapLocation(location, "current");
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        "POSITION_UNAVAILABLE",
        "Unable to determine your current location.",
      );
    }
  },

  async getLastKnownLocation(): Promise<UserLocation | null> {
    await ensureLocationAvailable();

    const location = await Location.getLastKnownPositionAsync({
      maxAge: 30_000,
      requiredAccuracy: 100,
    });

    if (!location) {
      return null;
    }

    return mapLocation(location, "cached");
  },

  async openSettings(): Promise<void> {
    await Linking.openSettings();
  },
};
