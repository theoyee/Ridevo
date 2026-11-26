import { useEffect, useRef, useState } from "react";

import { ActivityIndicator, Pressable, View } from "react-native";

import { LocateFixed } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import { RidevoMap } from "@/features/map/components/RidevoMap";

import { MAP_STYLES } from "@/features/map/constants/map.constants";

import type { MapController } from "@/features/map/types/map-bridge.types";

import { useActiveRideRoute } from "../hooks/useActiveRideRoute";

import { useSimulatedDriverPosition } from "../hooks/useSimulatedDriverPosition";

import type { Ride } from "../types/ride.types";

import { RideTrackingInfo } from "./RideTrackingInfo";

import { RIDE_CONFIG } from "../constants/ride.constants";

interface ActiveRideMapProps {
  ride: Ride;
}

export function ActiveRideMap({ ride }: ActiveRideMapProps) {
  const mapRef = useRef<MapController>(null);

  const [isMapReady, setIsMapReady] = useState(false);

  const { route, isLoading, error, retry } = useActiveRideRoute(ride);

  const position = useSimulatedDriverPosition(ride, route);

  const isTrip = ride.status === "in_progress";

  const pickup = ride.pickup.coordinates;

  const destination = ride.destination.coordinates;

  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    if (!route) {
      map.clearRoute();

      map.setCamera({
        centerCoordinate: [pickup.longitude, pickup.latitude],

        zoomLevel: 16,

        heading: 0,

        pitch: 0,

        duration: 500,
      });

      return;
    }

    map.setRoute({
      coordinates: route.coordinates,

      color: "#101820",

      width: 5,
    });

    map.fitCoordinates({
      coordinates: route.coordinates,

      padding: {
        top: 60,
        bottom: 60,
        left: 40,
        right: 40,
      },

      duration: 800,

      maxZoom: 16,
    });
  }, [isMapReady, route, pickup.longitude, pickup.latitude]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    if (isTrip) {
      mapRef.current.clearUserLocation();

      return;
    }

    // mapRef.current.setUserLocation({
    //   coordinates: [pickup.longitude, pickup.latitude],
    // });

    mapRef.current.setUserLocation([pickup.longitude, pickup.latitude]);
  }, [isMapReady, isTrip, pickup.longitude, pickup.latitude]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    if (position) {
      mapRef.current.setNearbyDrivers([
        {
          id: ride.driver?.id ?? "mock-driver",

          coordinates: position.coordinates,

          heading: position.heading,
        },
      ]);

      return;
    }

    if (ride.status === "arrived" && ride.driverLocation) {
      const location = ride.driverLocation;

      mapRef.current.setNearbyDrivers([
        {
          id: ride.driver?.id ?? "mock-driver",

          coordinates: [
            location.coordinates.longitude,
            location.coordinates.latitude,
          ],

          heading: location.heading,
        },
      ]);

      return;
    }

    mapRef.current.clearNearbyDrivers();
  }, [isMapReady, position, ride.driver?.id, ride.status, ride.driverLocation]);

  function handleRecenter() {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    if (position) {
      mapRef.current.setCamera({
        centerCoordinate: position.coordinates,

        zoomLevel: 16,

        heading: 0,

        pitch: 0,

        duration: 600,
      });

      return;
    }

    const target = isTrip ? destination : pickup;

    mapRef.current.setCamera({
      centerCoordinate: [target.longitude, target.latitude],

      zoomLevel: 16,

      duration: 600,
    });
  }

  return (
    <View className="relative flex-1 overflow-hidden">
      <RidevoMap
        ref={mapRef}
        styleURL={MAP_STYLES.streets}
        onReadyChange={setIsMapReady}
      />

      {isLoading && (
        <View className="absolute left-4 right-4 top-4 flex-row items-center gap-3 rounded-xl bg-white p-3">
          <ActivityIndicator color="#101820" />

          <Typography variant="small">Loading route...</Typography>
        </View>
      )}

      {error && (
        <View className="absolute left-4 right-4 top-4 gap-2 rounded-xl bg-white p-3">
          <Typography variant="small">
            Unable to load the driving route.
          </Typography>

          <Pressable
            accessibilityRole="button"
            onPress={() => void retry()}
            className="min-h-12 justify-center"
          >
            <Typography variant="bodyMedium">Retry</Typography>
          </Pressable>
        </View>
      )}

      {position && !isLoading && !error && ride.status !== "arrived" && (
        <View className="absolute left-4 right-4 top-4">
          <RideTrackingInfo
            remainingMeters={position.remainingMeters}
            remainingSeconds={
              ((1 - position.progress) *
                (isTrip
                  ? RIDE_CONFIG.mock.tripDurationMs
                  : RIDE_CONFIG.mock.arrivalDelayMs)) /
              1000
            }
          />
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Center map on ride"
        disabled={!isMapReady}
        onPress={handleRecenter}
        className="absolute bottom-4 right-4 h-12 w-12 items-center justify-center rounded-full border border-border bg-white"
      >
        <LocateFixed size={23} color="#101820" />
      </Pressable>
    </View>
  );
}
