import { useCallback, useEffect, useRef, type RefObject } from "react";

import type { UserLocation } from "@/features/location/types/location.types";
import type { MapController } from "../types/map-bridge.types";

import {
  isLocationFresh,
  toMapboxCoordinates,
} from "@/features/location/utils/location.utils";

interface UseMapCameraOptions {
  mapRef: RefObject<MapController | null>;
  location: UserLocation | null;
  isMapReady: boolean;
}

export function useMapCamera({
  mapRef,
  location,
  isMapReady,
}: UseMapCameraOptions) {
  const hasCentered = useRef(false);

  const recenter = useCallback(() => {
    if (!isMapReady || !location || !mapRef.current) {
      return false;
    }

    if (!isLocationFresh(location)) {
      return false;
    }

    mapRef.current.setCamera({
      centerCoordinate: toMapboxCoordinates(location),
      zoomLevel: 16,
      heading: 0,
      pitch: 0,
      duration: 800,
    });

    hasCentered.current = true;

    return true;
  }, [isMapReady, location, mapRef]);

  useEffect(() => {
    if (!isMapReady) {
      hasCentered.current = false;
      return;
    }

    if (!hasCentered.current) {
      recenter();
    }
  }, [isMapReady, recenter]);

  return {
    recenter,
  };
}
