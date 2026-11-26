import { useCallback, useEffect, useRef, useState } from "react";

import { Bell } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { locationService } from "@/features/location/services/location.service";

import {
  isLocationFresh,
  isValidCoordinates,
  toMapboxCoordinates,
} from "@/features/location/utils/location.utils";

import { RecenterButton } from "@/features/map/components/RecenterButton";
import { RidevoMap } from "@/features/map/components/RidevoMap";

import { useMapCamera } from "@/features/map/hooks/useMapCamera";
import { useMapLocation } from "@/features/map/hooks/useMapLocation";

import { MAP_STYLES } from "@/features/map/constants/map.constants";
import type { MapController } from "@/features/map/types/map-bridge.types";

import { driverService } from "@/features/drivers/services/driver.service";

import type { DriverCoordinates } from "@/features/drivers/types/driver.types";

import { useNearbyDrivers } from "@/features/drivers/hooks/useNearbyDrivers";

import { useNearbyDriverMarkers } from "@/features/map/hooks/useNearbyDriverMarkers";

import { MapDebugOverlay } from "@/features/map/components/MapDebugOverlay";

export function HomeScreen() {
  const mapRef = useRef<MapController>(null);

  const [isMapReady, setIsMapReady] = useState(false);

  const [isLocating, setIsLocating] = useState(false);

  const [locationError, setLocationError] = useState<string | null>(null);

  const firstName = useAuthStore((state) => state.session?.user.firstName);

  const { location, isTracking, error } = useMapLocation();

  const {
    drivers,
    isActive: isDriverTrackingActive,
    isFetching: isFetchingDrivers,
    error: driverError,
    lastUpdatedAt,
  } = useNearbyDrivers({
    location,
    enabled: __DEV__ && isMapReady,
  });

  useNearbyDriverMarkers({
    mapRef,
    drivers,
    isMapReady,
    enabled: isDriverTrackingActive,
  });

  useEffect(() => {
    if (__DEV__ && driverError) {
      console.warn("[Ridevo] Nearby drivers:", driverError.message);
    }
  }, [driverError]);

  const { recenter } = useMapCamera({
    mapRef,
    location,
    isMapReady,
  });

  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    if (
      !location ||
      !isValidCoordinates(location) ||
      !isLocationFresh(location)
    ) {
      mapRef.current.clearUserLocation();
      return;
    }

    mapRef.current.setUserLocation(
      toMapboxCoordinates(location),
      location.accuracy ?? undefined,
    );
  }, [location, isMapReady]);

  const driverTestLocationRef = useRef<DriverCoordinates | null>(null);

  useEffect(() => {
    driverTestLocationRef.current = location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      : null;
  }, [location]);

  const hasDriverTestLocation = Boolean(location);

  useEffect(() => {
    if (!__DEV__ || !isMapReady || !hasDriverTestLocation) {
      return;
    }

    let disposed = false;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const controller = mapRef.current;

    async function updateDrivers() {
      if (disposed) return;

      try {
        const center = driverTestLocationRef.current;

        if (!center) {
          controller?.clearNearbyDrivers();

          return;
        }

        const response = await driverService.getNearbyDrivers({
          latitude: center.latitude,
          longitude: center.longitude,
          radius: 600,
          limit: 10,
        });

        if (disposed) return;

        controller?.setNearbyDrivers(
          response.drivers.map((driver) => ({
            id: driver.id,

            coordinates: [
              driver.coordinates.longitude,
              driver.coordinates.latitude,
            ],

            heading: driver.heading,
          })),
        );
      } catch (error) {
        if (!disposed) {
          console.warn("[Ridevo] Driver simulation failed:", error);
        }
      } finally {
        if (!disposed) {
          timeout = setTimeout(updateDrivers, 3000);
        }
      }
    }

    void updateDrivers();

    return () => {
      disposed = true;

      if (timeout !== null) {
        clearTimeout(timeout);
      }

      controller?.clearNearbyDrivers();
    };
  }, [isMapReady, hasDriverTestLocation]);

  const handleRecenter = useCallback(async () => {
    if (isLocating || !isMapReady) {
      return;
    }

    setLocationError(null);

    if (recenter()) {
      return;
    }

    setIsLocating(true);

    try {
      const position = await locationService.getCurrentLocation();

      if (!isValidCoordinates(position)) {
        throw new Error("Invalid GPS coordinates.");
      }

      const coordinates = toMapboxCoordinates(position);

      mapRef.current?.setUserLocation(
        coordinates,
        position.accuracy ?? undefined,
      );

      mapRef.current?.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: 16,
        heading: 0,
        pitch: 0,
        duration: 800,
      });
    } catch (cause) {
      setLocationError(
        cause instanceof Error
          ? cause.message
          : "Unable to find your location.",
      );
    } finally {
      setIsLocating(false);
    }
  }, [isLocating, isMapReady, recenter]);

  const displayError = locationError ?? error;

  return (
    <Screen edges={["top"]}>
      <View className="relative flex-1">
        {/* Map */}
        <RidevoMap
          ref={mapRef}
          styleURL={MAP_STYLES.light}
          onReadyChange={setIsMapReady}
        />

        {/* Floating header */}
        <View
          pointerEvents="box-none"
          className="absolute left-4 right-4 top-4"
        >
          <View
            className="flex-row items-center justify-between
              rounded-full border border-border
              bg-white px-5 py-3"
          >
            <BrandLogo width={105} height={32} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="h-10 w-10 items-center
                justify-center rounded-full bg-surface"
            >
              <Bell size={22} color="#101820" strokeWidth={1.8} />
            </Pressable>
          </View>

          {/* GPS status */}
          {displayError && (
            <View
              className="mt-3 rounded-2xl
                border border-border bg-white p-3"
            >
              <Typography variant="small" className="text-muted">
                {displayError}
              </Typography>

              <Pressable
                onPress={() => {
                  void locationService.openSettings();
                }}
                className="mt-2"
              >
                <Typography variant="small" className="font-semibold text-info">
                  Open settings
                </Typography>
              </Pressable>
            </View>
          )}
        </View>

        {/* Recenter button */}
        <View className="absolute bottom-4 right-4">
          <RecenterButton
            onPress={handleRecenter}
            loading={isLocating}
            disabled={!isMapReady}
          />
        </View>

        {__DEV__ && isTracking && (
          <View
            className="absolute bottom-4 left-4
              rounded-full bg-white px-3 py-2"
          >
            <Typography variant="caption">GPS active</Typography>
          </View>
        )}

        {__DEV__ && isDriverTrackingActive && (
          <View className="absolute left-4 top-24 rounded-full bg-primary px-3 py-2">
            <Typography variant="caption" className="text-white">
              {drivers.length} nearby drivers
              {isFetchingDrivers ? " · Updating" : ""}
            </Typography>
          </View>
        )}
        {__DEV__ && (
          <MapDebugOverlay
            isMapReady={isMapReady}
            isTracking={isTracking}
            isFetchingDrivers={isFetchingDrivers}
            driverCount={drivers.length}
            locationAccuracy={location?.accuracy ?? null}
            lastUpdatedAt={lastUpdatedAt}
          />
        )}
      </View>

      {/* Temporary booking panel */}
      <View
        className="rounded-t-[28px] border-t
          border-border bg-white px-6 pb-6 pt-4"
      >
        <View
          className="mb-4 h-1 w-10 self-center
            rounded-full bg-border"
        />

        <Typography variant="small" className="text-muted">
          {firstName ? `Welcome, ${firstName}` : "Your next journey"}
        </Typography>

        <Typography variant="h1" className="mt-1">
          Where to?
        </Typography>

        <Typography variant="body" className="mt-1 text-muted">
          Your next journey starts here.
        </Typography>
      </View>
    </Screen>
  );
}
