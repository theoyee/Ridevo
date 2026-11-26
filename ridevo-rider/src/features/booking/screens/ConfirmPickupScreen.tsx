import { useCallback, useEffect, useRef, useState } from "react";

import { Alert, Pressable, View } from "react-native";

import { LocateFixed, MapPin } from "lucide-react-native";

import { useRouter } from "expo-router";

import { Screen } from "@/components/layout/Screen";
import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useLocationStore } from "@/features/location/stores/location.store";

import {
  distanceInMeters,
  isLocationFresh,
  isValidCoordinates,
} from "@/features/location/utils/location.utils";

import { RidevoMap } from "@/features/map/components/RidevoMap";

import { MAP_STYLES } from "@/features/map/constants/map.constants";

import type {
  MapController,
  MapEvent,
} from "@/features/map/types/map-bridge.types";

import type { PlaceCoordinates } from "@/features/places/types/place.types";

import { BookingHeader } from "../components/BookingHeader";

import { BOOKING_CONFIG } from "../constants/booking.constants";

import { useBookingStore } from "../stores/booking.store";

export function ConfirmPickupScreen() {
  const router = useRouter();

  const mapRef = useRef<MapController>(null);

  const navigationLock = useRef(false);

  const initializedPickup = useRef<PlaceCoordinates | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);

  const [selectedCoordinates, setSelectedCoordinates] =
    useState<PlaceCoordinates | null>(null);

  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) =>
    userId && state.draft?.userId === userId ? state.draft : null,
  );

  const currentLocation = useLocationStore((state) => state.currentLocation);

  const pickup = draft?.pickup;

  const destination = draft?.destination;

  useEffect(() => {
    if (!isMapReady) {
      initializedPickup.current = null;
      return;
    }

    const controller = mapRef.current;

    if (!controller) return;

    const coordinates = pickup?.coordinates ?? destination?.coordinates;

    if (!coordinates) return;

    const previous = initializedPickup.current;

    if (
      previous &&
      previous.latitude === coordinates.latitude &&
      previous.longitude === coordinates.longitude
    ) {
      return;
    }

    initializedPickup.current = coordinates;

    setSelectedCoordinates(null);

    controller.setCamera({
      centerCoordinate: [coordinates.longitude, coordinates.latitude],
      zoomLevel: 17,
      heading: 0,
      pitch: 0,
      duration: 0,
    });

    controller.getCamera();
  }, [isMapReady, pickup, destination]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    if (
      !currentLocation ||
      !isValidCoordinates(currentLocation) ||
      !isLocationFresh(currentLocation)
    ) {
      mapRef.current.clearUserLocation();
      return;
    }

    mapRef.current.setUserLocation(
      [currentLocation.longitude, currentLocation.latitude],
      currentLocation.accuracy ?? undefined,
    );
  }, [isMapReady, currentLocation]);

  const handleMapEvent = useCallback((event: MapEvent) => {
    if (event.type !== "CAMERA_CHANGED") {
      return;
    }

    const [longitude, latitude] = event.payload.coordinates;

    const coordinates = {
      latitude,
      longitude,
    };

    if (!isValidCoordinates(coordinates)) {
      return;
    }

    setSelectedCoordinates(coordinates);
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }, [router]);

  const handleChangePickup = useCallback(() => {
    router.push({
      pathname: BOOKING_CONFIG.routes.destinationSearch,

      params: {
        mode: "pickup",
      },
    });
  }, [router]);

  const handleRecenter = useCallback(() => {
    if (
      !currentLocation ||
      !isValidCoordinates(currentLocation) ||
      !isLocationFresh(currentLocation)
    ) {
      Alert.alert(
        "Location unavailable",
        "Choose your pickup manually or enable location services.",
      );

      return;
    }

    setSelectedCoordinates(null);

    mapRef.current?.setCamera({
      centerCoordinate: [currentLocation.longitude, currentLocation.latitude],

      zoomLevel: 17,

      heading: 0,

      pitch: 0,

      duration: 500,
    });
  }, [currentLocation]);

  const hasMoved =
    selectedCoordinates &&
    pickup &&
    distanceInMeters(selectedCoordinates, pickup.coordinates) > 5;

  const pickupLabel =
    !hasMoved && pickup
      ? (pickup.address ?? pickup.name ?? "Current location")
      : "Selected pickup point";

  const handleConfirm = useCallback(() => {
    if (
      navigationLock.current ||
      !userId ||
      !selectedCoordinates ||
      !destination ||
      !isMapReady
    ) {
      return;
    }

    navigationLock.current = true;

    try {
      const booking = useBookingStore.getState();

      const existingPickup = booking.draft?.pickup;

      const unchanged =
        existingPickup &&
        distanceInMeters(existingPickup.coordinates, selectedCoordinates) <= 5;

      if (!unchanged) {
        booking.setPickup(userId, {
          coordinates: selectedCoordinates,

          name: "Selected pickup point",

          address: null,

          source: "map",

          accuracy: null,

          capturedAt: Date.now(),
        });
      }

      booking.confirmPickup(userId);

      router.push(BOOKING_CONFIG.routes.confirmDestination);
    } catch (error) {
      Alert.alert(
        "Unable to confirm pickup",

        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      navigationLock.current = false;
    }
  }, [userId, selectedCoordinates, destination, isMapReady, router]);

  const canConfirm = Boolean(isMapReady && selectedCoordinates && destination);

  return (
    <Screen>
      <View className="flex-1">
        <BookingHeader title="Confirm pickup" onBack={handleBack} />

        <View className="relative flex-1 overflow-hidden">
          <RidevoMap
            ref={mapRef}
            styleURL={MAP_STYLES.streets}
            onReadyChange={setIsMapReady}
            onEvent={handleMapEvent}
          />

          {isMapReady && (
            <>
              <View
                pointerEvents="none"
                className="absolute inset-0 items-center justify-center"
              >
                <View
                  className="items-center"
                  style={{
                    transform: [{ translateY: -24 }],
                  }}
                >
                  <MapPin
                    size={48}
                    color="#101820"
                    fill="#C8F560"
                    strokeWidth={1.8}
                  />
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Use current location"
                onPress={handleRecenter}
                className="absolute bottom-4 right-4 h-12 w-12 items-center justify-center rounded-full border border-border bg-white"
              >
                <LocateFixed size={23} color="#101820" strokeWidth={1.8} />
              </Pressable>
            </>
          )}
        </View>

        <View className="gap-4 bg-white px-6 pb-4 pt-5">
          <View>
            <Typography variant="h2">Pickup location</Typography>

            <Typography variant="small" className="mt-1 text-muted">
              Move the map to adjust your pickup point.
            </Typography>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change pickup address"
            onPress={handleChangePickup}
            className="min-h-[72px] flex-row items-center gap-3 rounded-2xl bg-surface p-4"
          >
            <MapPin size={23} color="#2563EB" />

            <View className="flex-1">
              <Typography variant="bodyMedium" numberOfLines={2}>
                {pickupLabel}
              </Typography>

              <Typography variant="caption" className="mt-1 text-muted">
                Pickup address
              </Typography>
            </View>

            <Typography variant="small">Change</Typography>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: !canConfirm,
            }}
            disabled={!canConfirm}
            onPress={handleConfirm}
            className="min-h-14 items-center justify-center rounded-full bg-accent active:opacity-80 disabled:opacity-50"
          >
            <Typography variant="bodyMedium">Confirm pickup</Typography>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
