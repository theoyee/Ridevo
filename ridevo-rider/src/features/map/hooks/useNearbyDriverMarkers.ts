import { useEffect, type RefObject } from "react";

import type { NearbyDriver } from "@/features/drivers/types/driver.types";

import type { MapController, MapVehicle } from "../types/map-bridge.types";

interface UseNearbyDriverMarkersOptions {
  mapRef: RefObject<MapController | null>;

  drivers: NearbyDriver[];

  isMapReady: boolean;

  enabled?: boolean;
}

export function useNearbyDriverMarkers({
  mapRef,
  drivers,
  isMapReady,
  enabled = true,
}: UseNearbyDriverMarkersOptions) {
  // Synchronize the latest driver snapshot.
  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    if (!enabled || drivers.length === 0) {
      mapRef.current.clearNearbyDrivers();

      return;
    }

    const vehicles: MapVehicle[] = drivers
      .filter((driver) => driver.availability === "available")
      .map((driver) => ({
        id: driver.id,

        coordinates: [
          driver.coordinates.longitude,
          driver.coordinates.latitude,
        ],

        heading: driver.heading,
      }));

    mapRef.current.setNearbyDrivers(vehicles);
  }, [mapRef, drivers, isMapReady, enabled]);

  // Clear markers when synchronization is disposed.
  useEffect(() => {
    const controller = mapRef.current;

    return () => {
      controller?.clearNearbyDrivers();
    };
  }, [mapRef, isMapReady, enabled]);
}
