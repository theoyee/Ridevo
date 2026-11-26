import { useEffect, useRef, useState } from "react";

import { View } from "react-native";

import { RidevoMap } from "@/features/map/components/RidevoMap";

import { MAP_STYLES } from "@/features/map/constants/map.constants";

import type { MapController } from "@/features/map/types/map-bridge.types";

import type { RideRoute } from "../types/booking.types";

interface BookingRouteMapProps {
  route: RideRoute | null;
}

export function BookingRouteMap({ route }: BookingRouteMapProps) {
  const mapRef = useRef<MapController>(null);

  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const controller = mapRef.current;

    if (!isMapReady || !controller) {
      return;
    }

    if (!route) {
      controller.clearRoute();
      return;
    }

    controller.setRoute({
      coordinates: route.coordinates,

      color: "#101820",

      width: 5,
    });

    controller.fitCoordinates({
      coordinates: route.coordinates,

      padding: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },

      duration: 800,

      maxZoom: 16,
    });
  }, [isMapReady, route]);

  return (
    <View className="flex-1 overflow-hidden">
      <RidevoMap
        ref={mapRef}
        styleURL={MAP_STYLES.streets}
        onReadyChange={setIsMapReady}
      />
    </View>
  );
}
